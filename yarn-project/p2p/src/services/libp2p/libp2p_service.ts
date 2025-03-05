import type { EpochCacheInterface } from '@aztec/epoch-cache';
import { Fr } from '@aztec/foundation/fields';
import { createLibp2pComponentLogger, createLogger } from '@aztec/foundation/log';
import { SerialQueue } from '@aztec/foundation/queue';
import { RunningPromise } from '@aztec/foundation/running-promise';
import type { AztecAsyncKVStore } from '@aztec/kv-store';
import type { L2BlockSource } from '@aztec/stdlib/block';
import type { ClientProtocolCircuitVerifier, PeerInfo, WorldStateSynchronizer } from '@aztec/stdlib/interfaces/server';
import {
  BlockAttestation,
  BlockProposal,
  type Gossipable,
  P2PClientType,
  PeerErrorSeverity,
  TopicTypeMap,
  getTopicTypeForClientType,
  metricsTopicStrToLabels,
} from '@aztec/stdlib/p2p';
import { MerkleTreeId } from '@aztec/stdlib/trees';
import { Tx, type TxHash, type TxValidationResult } from '@aztec/stdlib/tx';
import { Attributes, OtelMetricsAdapter, type TelemetryClient, WithTracer, trackSpan } from '@aztec/telemetry-client';

import type { ENR } from '@chainsafe/enr';
import {
  type GossipSub,
  type GossipSubComponents,
  type GossipsubMessage,
  gossipsub,
} from '@chainsafe/libp2p-gossipsub';
import { createPeerScoreParams, createTopicScoreParams } from '@chainsafe/libp2p-gossipsub/score';
import { SignaturePolicy } from '@chainsafe/libp2p-gossipsub/types';
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import { bootstrap } from '@libp2p/bootstrap';
import { identify } from '@libp2p/identify';
import { type Message, type PeerId, TopicValidatorResult } from '@libp2p/interface';
import type { ConnectionManager } from '@libp2p/interface-internal';
import '@libp2p/kad-dht';
import { mplex } from '@libp2p/mplex';
import { tcp } from '@libp2p/tcp';
import { createLibp2p } from 'libp2p';

import type { P2PConfig } from '../../config.js';
import type { MemPools } from '../../mem_pools/interface.js';
import { AttestationValidator, BlockProposalValidator } from '../../msg_validators/index.js';
import {
  DataTxValidator,
  DoubleSpendTxValidator,
  MetadataTxValidator,
  TxProofValidator,
} from '../../msg_validators/tx_validator/index.js';
import { GossipSubEvent } from '../../types/index.js';
import { type PubSubLibp2p, convertToMultiaddr } from '../../util.js';
import { AztecDatastore } from '../data_store.js';
import { SnappyTransform, fastMsgIdFn, getMsgIdFn, msgIdToStrFn } from '../encoding.js';
import { gossipScoreThresholds } from '../gossipsub/scoring.js';
import { PeerManager } from '../peer-manager/peer_manager.js';
import { PeerScoring } from '../peer-manager/peer_scoring.js';
import { DEFAULT_SUB_PROTOCOL_VALIDATORS, ReqRespSubProtocol, type SubProtocolMap } from '../reqresp/interface.js';
import { reqGoodbyeHandler } from '../reqresp/protocols/goodbye.js';
import { pingHandler, reqRespBlockHandler, reqRespTxHandler, statusHandler } from '../reqresp/protocols/index.js';
import { ReqResp } from '../reqresp/reqresp.js';
import type { P2PService, PeerDiscoveryService } from '../service.js';

interface MessageValidator {
  validator: {
    validateTx(tx: Tx): Promise<TxValidationResult>;
  };
  severity: PeerErrorSeverity;
}

interface ValidationResult {
  name: string;
  isValid: TxValidationResult;
  severity: PeerErrorSeverity;
}

type ValidationOutcome = { allPassed: true } | { allPassed: false; failure: ValidationResult };

/**
 * Lib P2P implementation of the P2PService interface.
 */
export class LibP2PService<T extends P2PClientType> extends WithTracer implements P2PService {
  private jobQueue: SerialQueue = new SerialQueue();
  private peerManager: PeerManager;
  private discoveryRunningPromise?: RunningPromise;

  // Message validators
  private attestationValidator: AttestationValidator;
  private blockProposalValidator: BlockProposalValidator;

  // Request and response sub service
  public reqresp: ReqResp;

  /**
   * Callback for when a block is received from a peer.
   * @param block - The block received from the peer.
   * @returns The attestation for the block, if any.
   */
  private blockReceivedCallback: (block: BlockProposal) => Promise<BlockAttestation | undefined>;

  constructor(
    private clientType: T,
    private config: P2PConfig,
    private node: PubSubLibp2p,
    private peerDiscoveryService: PeerDiscoveryService,
    private mempools: MemPools<T>,
    private l2BlockSource: L2BlockSource,
    epochCache: EpochCacheInterface,
    private proofVerifier: ClientProtocolCircuitVerifier,
    private worldStateSynchronizer: WorldStateSynchronizer,
    telemetry: TelemetryClient,
    private logger = createLogger('p2p:libp2p_service'),
  ) {
    super(telemetry, 'LibP2PService');

    const peerScoring = new PeerScoring(config);
    this.reqresp = new ReqResp(config, node, peerScoring);

    this.peerManager = new PeerManager(
      node,
      peerDiscoveryService,
      config,
      telemetry,
      createLogger(`${logger.module}:peer_manager`),
      peerScoring,
      this.reqresp,
    );

    // Update gossipsub score params
    this.node.services.pubsub.score.params.appSpecificScore = (peerId: string) => {
      return this.peerManager.getPeerScore(peerId);
    };
    this.node.services.pubsub.score.params.appSpecificWeight = 10;

    this.attestationValidator = new AttestationValidator(epochCache);
    this.blockProposalValidator = new BlockProposalValidator(epochCache);

    this.blockReceivedCallback = async (block: BlockProposal): Promise<BlockAttestation | undefined> => {
      this.logger.warn(
        `Handler not yet registered: Block received callback not set. Received block for slot ${block.slotNumber.toNumber()} from peer.`,
        { p2pMessageIdentifier: await block.p2pMessageIdentifier() },
      );
      return undefined;
    };
  }

  /**
   * Creates an instance of the LibP2P service.
   * @param config - The configuration to use when creating the service.
   * @param txPool - The transaction pool to be accessed by the service.
   * @returns The new service.
   */
  public static async new<T extends P2PClientType>(
    clientType: T,
    config: P2PConfig,
    peerDiscoveryService: PeerDiscoveryService,
    peerId: PeerId,
    mempools: MemPools<T>,
    l2BlockSource: L2BlockSource,
    epochCache: EpochCacheInterface,
    proofVerifier: ClientProtocolCircuitVerifier,
    worldStateSynchronizer: WorldStateSynchronizer,
    store: AztecAsyncKVStore,
    telemetry: TelemetryClient,
    logger = createLogger('p2p:libp2p_service'),
  ) {
    const { tcpListenAddress, tcpAnnounceAddress, maxPeerCount } = config;
    const bindAddrTcp = convertToMultiaddr(tcpListenAddress, 'tcp');
    // We know tcpAnnounceAddress cannot be null here because we set it or throw when setting up the service.
    const announceAddrTcp = convertToMultiaddr(tcpAnnounceAddress!, 'tcp');

    const datastore = new AztecDatastore(store);

    const otelMetricsAdapter = new OtelMetricsAdapter(telemetry);

    // If bootstrap nodes are provided, also provide them to the p2p service
    const peerDiscovery = [];
    if (peerDiscoveryService.bootstrapNodes.length > 0) {
      peerDiscovery.push(bootstrap({ list: peerDiscoveryService.bootstrapNodes }));
    }

    const node = await createLibp2p({
      start: false,
      peerId,
      addresses: {
        listen: [bindAddrTcp],
        announce: [announceAddrTcp],
      },
      transports: [
        tcp({
          maxConnections: config.maxPeerCount,
          // socket option: the maximum length of the queue of pending connections
          // https://nodejs.org/dist/latest-v18.x/docs/api/net.html#serverlisten
          // it's not safe if we increase this number
          backlog: 5,
          closeServerOnMaxConnections: {
            closeAbove: maxPeerCount ?? Infinity,
            listenBelow: maxPeerCount ?? Infinity,
          },
        }),
      ],
      datastore,
      peerDiscovery,
      streamMuxers: [mplex(), yamux()],
      connectionEncryption: [noise()],
      connectionManager: {
        minConnections: 0,

        maxParallelDials: 100,
        dialTimeout: 30_000,
        maxPeerAddrsToDial: 5,
        maxIncomingPendingConnections: 5,
      },
      services: {
        identify: identify({
          protocolPrefix: 'aztec',
        }),
        pubsub: gossipsub({
          debugName: 'gossipsub',
          globalSignaturePolicy: SignaturePolicy.StrictNoSign,
          allowPublishToZeroTopicPeers: true,
          floodPublish: config.gossipsubFloodPublish,
          D: config.gossipsubD,
          Dlo: config.gossipsubDlo,
          Dhi: config.gossipsubDhi,
          Dlazy: config.gossipsubDLazy,
          heartbeatInterval: config.gossipsubInterval,
          mcacheLength: config.gossipsubMcacheLength,
          mcacheGossip: config.gossipsubMcacheGossip,
          msgIdFn: getMsgIdFn,
          msgIdToStrFn: msgIdToStrFn,
          fastMsgIdFn: fastMsgIdFn,
          dataTransform: new SnappyTransform(),
          metricsRegister: otelMetricsAdapter,
          metricsTopicStrToLabel: metricsTopicStrToLabels(),
          asyncValidation: true,
          scoreThresholds: gossipScoreThresholds,
          scoreParams: createPeerScoreParams({
            // IPColocation factor can be disabled for local testing - default to -5
            IPColocationFactorWeight: config.debugDisableColocationPenalty ? 0 : -5.0,
            topics: {
              [Tx.p2pTopic]: createTopicScoreParams({
                topicWeight: 1,
                invalidMessageDeliveriesWeight: -20,
                invalidMessageDeliveriesDecay: 0.5,
              }),
              [BlockAttestation.p2pTopic]: createTopicScoreParams({
                topicWeight: 1,
                invalidMessageDeliveriesWeight: -20,
                invalidMessageDeliveriesDecay: 0.5,
              }),
              [BlockProposal.p2pTopic]: createTopicScoreParams({
                topicWeight: 1,
                invalidMessageDeliveriesWeight: -20,
                invalidMessageDeliveriesDecay: 0.5,
              }),
            },
          }),
        }) as (components: GossipSubComponents) => GossipSub,
        components: (components: { connectionManager: ConnectionManager }) => ({
          connectionManager: components.connectionManager,
        }),
      },
      logger: createLibp2pComponentLogger(logger.module),
    });

    return new LibP2PService(
      clientType,
      config,
      node,
      peerDiscoveryService,
      mempools,
      l2BlockSource,
      epochCache,
      proofVerifier,
      worldStateSynchronizer,
      telemetry,
      logger,
    );
  }

  /**
   * Starts the LibP2P service.
   * @returns An empty promise.
   */
  public async start() {
    // Check if service is already started
    if (this.node.status === 'started') {
      throw new Error('P2P service already started');
    }

    // Get listen & announce addresses for logging
    const { tcpListenAddress, tcpAnnounceAddress } = this.config;
    if (!tcpAnnounceAddress) {
      throw new Error('Announce address not provided.');
    }
    const announceTcpMultiaddr = convertToMultiaddr(tcpAnnounceAddress, 'tcp');

    // Start job queue, peer discovery service and libp2p node
    this.jobQueue.start();
    await this.peerDiscoveryService.start();
    await this.node.start();

    // Subscribe to standard GossipSub topics by default
    for (const topic of getTopicTypeForClientType(this.clientType)) {
      this.subscribeToTopic(TopicTypeMap[topic].p2pTopic);
    }

    // Create request response protocol handlers
    const txHandler = reqRespTxHandler(this.mempools);
    const goodbyeHandler = reqGoodbyeHandler(this.peerManager);
    const blockHandler = reqRespBlockHandler(this.l2BlockSource);

    const requestResponseHandlers = {
      [ReqRespSubProtocol.PING]: pingHandler,
      [ReqRespSubProtocol.STATUS]: statusHandler,
      [ReqRespSubProtocol.TX]: txHandler.bind(this),
      [ReqRespSubProtocol.GOODBYE]: goodbyeHandler.bind(this),
      [ReqRespSubProtocol.BLOCK]: blockHandler.bind(this),
    };

    // add GossipSub listener
    this.node.services.pubsub.addEventListener(GossipSubEvent.MESSAGE, this.handleGossipSubEvent.bind(this));

    // Start running promise for peer discovery
    this.discoveryRunningPromise = new RunningPromise(
      () => this.peerManager.heartbeat(),
      this.logger,
      this.config.peerCheckIntervalMS,
    );
    this.discoveryRunningPromise.start();

    // Define the sub protocol validators - This is done within this start() method to gain a callback to the existing validateTx function
    const reqrespSubProtocolValidators = {
      ...DEFAULT_SUB_PROTOCOL_VALIDATORS,
      // TODO(#11336): A request validator for blocks
      [ReqRespSubProtocol.TX]: this.validateRequestedTx.bind(this),
    };
    await this.reqresp.start(requestResponseHandlers, reqrespSubProtocolValidators);
    this.logger.info(`Started P2P service`, {
      listen: tcpListenAddress,
      announce: announceTcpMultiaddr,
      peerId: this.node.peerId.toString(),
    });
  }

  /**
   * Stops the LibP2P service.
   * @returns An empty promise.
   */
  public async stop() {
    // Remove gossip sub listener
    this.node.services.pubsub.removeEventListener(GossipSubEvent.MESSAGE, this.handleGossipSubEvent.bind(this));

    // Stop peer manager
    this.logger.debug('Stopping peer manager...');
    await this.peerManager.stop();

    this.logger.debug('Stopping job queue...');
    await this.jobQueue.end();
    this.logger.debug('Stopping running promise...');
    await this.discoveryRunningPromise?.stop();
    this.logger.debug('Stopping peer discovery service...');
    await this.peerDiscoveryService.stop();
    this.logger.debug('Request response service stopped...');
    await this.reqresp.stop();
    this.logger.debug('Stopping LibP2P...');
    await this.stopLibP2P();
    this.logger.info('LibP2P service stopped');
  }

  public getPeers(includePending?: boolean): PeerInfo[] {
    return this.peerManager.getPeers(includePending);
  }

  private handleGossipSubEvent(e: CustomEvent<GossipsubMessage>) {
    this.logger.trace(`Received PUBSUB message.`);

    const safeJob = async () => {
      try {
        await this.handleNewGossipMessage(e.detail.msg, e.detail.msgId, e.detail.propagationSource);
      } catch (err) {
        this.logger.error(`Error handling gossipsub message: ${err}`);
      }
    };
    setImmediate(() => void safeJob());
  }

  /**
   * Send Request via the ReqResp service
   * The subprotocol defined will determine the request and response types
   *
   * See the subProtocolMap for the mapping of subprotocols to request/response types in `interface.ts`
   *
   * @param protocol The request response protocol to use
   * @param request The request type to send
   * @returns
   */
  sendRequest<SubProtocol extends ReqRespSubProtocol>(
    protocol: SubProtocol,
    request: InstanceType<SubProtocolMap[SubProtocol]['request']>,
  ): Promise<InstanceType<SubProtocolMap[SubProtocol]['response']> | undefined> {
    return this.reqresp.sendRequest(protocol, request);
  }

  /**
   * Send a batch of requests to peers, and return the responses
   * @param protocol - The request response protocol to use
   * @param requests - The requests to send to the peers
   * @returns The responses to the requests
   */
  sendBatchRequest<SubProtocol extends ReqRespSubProtocol>(
    protocol: SubProtocol,
    requests: InstanceType<SubProtocolMap[SubProtocol]['request']>[],
  ): Promise<InstanceType<SubProtocolMap[SubProtocol]['response']>[] | undefined> {
    return this.reqresp.sendBatchRequest(protocol, requests);
  }

  /**
   * Get the ENR of the node
   * @returns The ENR of the node
   */
  public getEnr(): ENR | undefined {
    return this.peerDiscoveryService.getEnr();
  }

  public registerBlockReceivedCallback(callback: (block: BlockProposal) => Promise<BlockAttestation | undefined>) {
    this.blockReceivedCallback = callback;
    this.logger.verbose('Block received callback registered');
  }

  /**
   * Subscribes to a topic.
   * @param topic - The topic to subscribe to.
   */
  private subscribeToTopic(topic: string) {
    if (!this.node.services.pubsub) {
      throw new Error('Pubsub service not available.');
    }
    void this.node.services.pubsub.subscribe(topic);
  }

  /**
   * Publishes data to a topic.
   * @param topic - The topic to publish to.
   * @param data - The data to publish.
   * @returns The number of recipients the data was sent to.
   */
  private async publishToTopic(topic: string, data: Uint8Array) {
    if (!this.node.services.pubsub) {
      throw new Error('Pubsub service not available.');
    }
    const result = await this.node.services.pubsub.publish(topic, data);

    return result.recipients.length;
  }

  /**
   * Handles a new gossip message that was received by the client.
   * @param topic - The message's topic.
   * @param data - The message data
   */
  private async handleNewGossipMessage(msg: Message, msgId: string, source: PeerId) {
    if (msg.topic === Tx.p2pTopic) {
      await this.handleGossipedTx(msg, msgId, source);
    }
    if (msg.topic === BlockAttestation.p2pTopic && this.clientType === P2PClientType.Full) {
      await this.processAttestationFromPeer(msg, msgId, source);
    }
    if (msg.topic == BlockProposal.p2pTopic) {
      await this.processBlockFromPeer(msg, msgId, source);
    }

    return;
  }

  private async validateReceivedMessage<T>(
    validationFunc: () => Promise<{ result: boolean; obj: T }>,
    msgId: string,
    source: PeerId,
  ): Promise<{ result: boolean; obj: T | undefined }> {
    let resultAndObj: { result: boolean; obj: T | undefined } = { result: false, obj: undefined };
    try {
      resultAndObj = await validationFunc();
    } catch (err) {
      this.logger.error(`Error deserialising and validating message `, err);
    }

    this.node.services.pubsub.reportMessageValidationResult(
      msgId,
      source.toString(),
      resultAndObj.result && resultAndObj.obj ? TopicValidatorResult.Accept : TopicValidatorResult.Reject,
    );
    return resultAndObj;
  }

  private async handleGossipedTx(msg: Message, msgId: string, source: PeerId) {
    const validationFunc = async () => {
      const tx = Tx.fromBuffer(Buffer.from(msg.data));
      const result = await this.validatePropagatedTx(tx, source);
      return { result, obj: tx };
    };

    const { result, obj: tx } = await this.validateReceivedMessage<Tx>(validationFunc, msgId, source);
    if (!result || !tx) {
      return;
    }
    const txHash = await tx.getTxHash();
    const txHashString = txHash.toString();
    this.logger.verbose(`Received tx ${txHashString} from external peer ${source.toString()}.`);
    await this.mempools.txPool.addTxs([tx]);
  }

  /**Process Attestation From Peer
   * When a proposal is received from a peer, we add it to the attestation pool, so it can be accessed by other services.
   *
   * @param attestation - The attestation to process.
   */
  private async processAttestationFromPeer(msg: Message, msgId: string, source: PeerId): Promise<void> {
    const validationFunc = async () => {
      const attestation = BlockAttestation.fromBuffer(Buffer.from(msg.data));
      const result = await this.validateAttestation(source, attestation);
      this.logger.trace(`validatePropagatedAttestation: ${result}`, {
        [Attributes.SLOT_NUMBER]: attestation.payload.header.globalVariables.slotNumber.toString(),
        [Attributes.P2P_ID]: source.toString(),
      });
      return { result, obj: attestation };
    };

    const { result, obj: attestation } = await this.validateReceivedMessage<BlockAttestation>(
      validationFunc,
      msgId,
      source,
    );
    if (!result || !attestation) {
      return;
    }
    this.logger.debug(
      `Received attestation for block ${attestation.blockNumber.toNumber()} slot ${attestation.slotNumber.toNumber()} from external peer.`,
      {
        p2pMessageIdentifier: await attestation.p2pMessageIdentifier(),
        slot: attestation.slotNumber.toNumber(),
        archive: attestation.archive.toString(),
        block: attestation.blockNumber.toNumber(),
      },
    );
    await this.mempools.attestationPool!.addAttestations([attestation]);
  }

  private async processBlockFromPeer(msg: Message, msgId: string, source: PeerId): Promise<void> {
    const validationFunc = async () => {
      const block = BlockProposal.fromBuffer(Buffer.from(msg.data));
      const result = await this.validateBlockProposal(source, block);
      this.logger.trace(`validatePropagatedBlock: ${result}`, {
        [Attributes.SLOT_NUMBER]: block.payload.header.globalVariables.slotNumber.toString(),
        [Attributes.P2P_ID]: source.toString(),
      });
      return { result, obj: block };
    };

    const { result, obj: block } = await this.validateReceivedMessage<BlockProposal>(validationFunc, msgId, source);
    if (!result || !block) {
      return;
    }
    await this.processValidBlockProposal(block);
  }

  // REVIEW: callback pattern https://github.com/AztecProtocol/aztec-packages/issues/7963
  @trackSpan('Libp2pService.processValidBlockProposal', async block => ({
    [Attributes.BLOCK_NUMBER]: block.blockNumber.toNumber(),
    [Attributes.SLOT_NUMBER]: block.slotNumber.toNumber(),
    [Attributes.BLOCK_ARCHIVE]: block.archive.toString(),
    [Attributes.P2P_ID]: await block.p2pMessageIdentifier().then(i => i.toString()),
  }))
  private async processValidBlockProposal(block: BlockProposal) {
    this.logger.verbose(
      `Received block ${block.blockNumber.toNumber()} for slot ${block.slotNumber.toNumber()} from external peer.`,
      {
        p2pMessageIdentifier: await block.p2pMessageIdentifier(),
        slot: block.slotNumber.toNumber(),
        archive: block.archive.toString(),
        block: block.blockNumber.toNumber(),
      },
    );
    const attestation = await this.blockReceivedCallback(block);

    // TODO: fix up this pattern - the abstraction is not nice
    // The attestation can be undefined if no handler is registered / the validator deems the block invalid
    if (attestation != undefined) {
      this.logger.verbose(
        `Broadcasting attestation for block ${attestation.blockNumber.toNumber()} slot ${attestation.slotNumber.toNumber()}`,
        {
          p2pMessageIdentifier: await attestation.p2pMessageIdentifier(),
          slot: attestation.slotNumber.toNumber(),
          archive: attestation.archive.toString(),
          block: attestation.blockNumber.toNumber(),
        },
      );
      await this.broadcastAttestation(attestation);
    }
  }

  /**
   * Broadcast an attestation to all peers.
   * @param attestation - The attestation to broadcast.
   */
  @trackSpan('Libp2pService.broadcastAttestation', async attestation => ({
    [Attributes.BLOCK_NUMBER]: attestation.payload.header.globalVariables.blockNumber.toNumber(),
    [Attributes.SLOT_NUMBER]: attestation.payload.header.globalVariables.slotNumber.toNumber(),
    [Attributes.BLOCK_ARCHIVE]: attestation.archive.toString(),
    [Attributes.P2P_ID]: await attestation.p2pMessageIdentifier().then(i => i.toString()),
  }))
  private async broadcastAttestation(attestation: BlockAttestation) {
    await this.propagate(attestation);
  }

  /**
   * Propagates provided message to peers.
   * @param message - The message to propagate.
   */
  public async propagate<T extends Gossipable>(message: T) {
    const p2pMessageIdentifier = await message.p2pMessageIdentifier();
    this.logger.trace(`Message ${p2pMessageIdentifier} queued`, { p2pMessageIdentifier });
    void this.jobQueue
      .put(async () => {
        await this.sendToPeers(message);
      })
      .catch(error => {
        this.logger.error(`Error propagating message ${p2pMessageIdentifier}`, { error });
      });
  }

  /**
   * Validate a tx that has been requested from a peer.
   *
   * The core component of this validator is that the tx hash MUST match the requested tx hash,
   * In order to perform this check, the tx proof must be verified.
   *
   * Note: This function is called from within `ReqResp.sendRequest` as part of the
   * ReqRespSubProtocol.TX subprotocol validation.
   *
   * @param requestedTxHash - The hash of the tx that was requested.
   * @param responseTx - The tx that was received as a response to the request.
   * @param peerId - The peer ID of the peer that sent the tx.
   * @returns True if the tx is valid, false otherwise.
   */
  @trackSpan('Libp2pService.validateRequestedTx', (requestedTxHash, _responseTx) => ({
    [Attributes.TX_HASH]: requestedTxHash.toString(),
  }))
  private async validateRequestedTx(requestedTxHash: TxHash, responseTx: Tx, peerId: PeerId): Promise<boolean> {
    const proofValidator = new TxProofValidator(this.proofVerifier);
    const validProof = await proofValidator.validateTx(responseTx);

    // If the node returns the wrong data, we penalize it
    if (!requestedTxHash.equals(await responseTx.getTxHash())) {
      // Returning the wrong data is a low tolerance error
      this.peerManager.penalizePeer(peerId, PeerErrorSeverity.MidToleranceError);
      return false;
    }

    if (validProof.result === 'invalid') {
      // If the proof is invalid, but the txHash is correct, then this is an active attack and we severly punish
      this.peerManager.penalizePeer(peerId, PeerErrorSeverity.LowToleranceError);
      return false;
    }

    return true;
  }

  @trackSpan('Libp2pService.validatePropagatedTx', async tx => ({
    [Attributes.TX_HASH]: (await tx.getTxHash()).toString(),
  }))
  private async validatePropagatedTx(tx: Tx, peerId: PeerId): Promise<boolean> {
    const blockNumber = (await this.l2BlockSource.getBlockNumber()) + 1;
    const messageValidators = this.createMessageValidators(blockNumber);
    const outcome = await this.runValidations(tx, messageValidators);

    if (outcome.allPassed) {
      return true;
    }
    const { name } = outcome.failure;
    let { severity } = outcome.failure;

    // Double spend validator has a special case handler
    if (name === 'doubleSpendValidator') {
      severity = await this.handleDoubleSpendFailure(tx, blockNumber);
    }

    this.peerManager.penalizePeer(peerId, severity);
    return false;
  }

  /**
   * Create message validators for the given block number.
   *
   * Each validator is a pair of a validator and a severity.
   * If a validator fails, the peer is penalized with the severity of the validator.
   *
   * @param blockNumber - The block number to create validators for.
   * @returns The message validators.
   */
  private createMessageValidators(blockNumber: number): Record<string, MessageValidator> {
    return {
      dataValidator: {
        validator: new DataTxValidator(),
        severity: PeerErrorSeverity.HighToleranceError,
      },
      metadataValidator: {
        validator: new MetadataTxValidator(new Fr(this.config.l1ChainId), new Fr(blockNumber)),
        severity: PeerErrorSeverity.HighToleranceError,
      },
      proofValidator: {
        validator: new TxProofValidator(this.proofVerifier),
        severity: PeerErrorSeverity.MidToleranceError,
      },
      doubleSpendValidator: {
        validator: new DoubleSpendTxValidator({
          nullifiersExist: async (nullifiers: Buffer[]) => {
            const merkleTree = this.worldStateSynchronizer.getCommitted();
            const indices = await merkleTree.findLeafIndices(MerkleTreeId.NULLIFIER_TREE, nullifiers);
            return indices.map(index => index !== undefined);
          },
        }),
        severity: PeerErrorSeverity.HighToleranceError,
      },
    };
  }

  /**
   * Run validations on a tx.
   * @param tx - The tx to validate.
   * @param messageValidators - The message validators to run.
   * @returns The validation outcome.
   */
  private async runValidations(
    tx: Tx,
    messageValidators: Record<string, MessageValidator>,
  ): Promise<ValidationOutcome> {
    const validationPromises = Object.entries(messageValidators).map(async ([name, { validator, severity }]) => {
      const { result } = await validator.validateTx(tx);
      return { name, isValid: result === 'valid', severity };
    });

    // A promise that resolves when all validations have been run
    const allValidations = Promise.all(validationPromises);

    // A promise that resolves when the first validation fails
    const firstFailure = Promise.race(
      validationPromises.map(async promise => {
        const result = await promise;
        return result.isValid ? new Promise(() => {}) : result;
      }),
    );

    // Wait for the first validation to fail or all validations to pass
    const result = await Promise.race([
      allValidations.then(() => ({ allPassed: true as const })),
      firstFailure.then(failure => ({ allPassed: false as const, failure: failure as ValidationResult })),
    ]);

    // If all validations pass, allPassed will be true, if failed, then the failure will be the first validation to fail
    return result;
  }

  /**
   * Handle a double spend failure.
   *
   * Double spend failures are managed on their own because they are a special case.
   * We must check if the double spend is recent or old, if it is past a threshold, then we heavily penalize the peer.
   *
   * @param tx - The tx that failed the double spend validator.
   * @param blockNumber - The block number of the tx.
   * @param peerId - The peer ID of the peer that sent the tx.
   * @returns Severity
   */
  private async handleDoubleSpendFailure(tx: Tx, blockNumber: number): Promise<PeerErrorSeverity> {
    if (blockNumber <= this.config.doubleSpendSeverePeerPenaltyWindow) {
      return PeerErrorSeverity.HighToleranceError;
    }

    const snapshotValidator = new DoubleSpendTxValidator({
      nullifiersExist: async (nullifiers: Buffer[]) => {
        const merkleTree = this.worldStateSynchronizer.getSnapshot(
          blockNumber - this.config.doubleSpendSeverePeerPenaltyWindow,
        );
        const indices = await merkleTree.findLeafIndices(MerkleTreeId.NULLIFIER_TREE, nullifiers);
        return indices.map(index => index !== undefined);
      },
    });

    const validSnapshot = await snapshotValidator.validateTx(tx);
    if (validSnapshot.result !== 'valid') {
      return PeerErrorSeverity.LowToleranceError;
    }

    return PeerErrorSeverity.HighToleranceError;
  }

  /**
   * Validate an attestation.
   *
   * @param attestation - The attestation to validate.
   * @returns True if the attestation is valid, false otherwise.
   */
  @trackSpan('Libp2pService.validateAttestation', async (_, attestation) => ({
    [Attributes.BLOCK_NUMBER]: attestation.payload.header.globalVariables.blockNumber.toNumber(),
    [Attributes.SLOT_NUMBER]: attestation.payload.header.globalVariables.slotNumber.toNumber(),
    [Attributes.BLOCK_ARCHIVE]: attestation.archive.toString(),
    [Attributes.P2P_ID]: await attestation.p2pMessageIdentifier().then(i => i.toString()),
  }))
  public async validateAttestation(peerId: PeerId, attestation: BlockAttestation): Promise<boolean> {
    const severity = await this.attestationValidator.validate(attestation);
    if (severity) {
      this.peerManager.penalizePeer(peerId, severity);
      return false;
    }

    return true;
  }

  /**
   * Validate a block proposal.
   *
   * @param block - The block proposal to validate.
   * @returns True if the block proposal is valid, false otherwise.
   */
  @trackSpan('Libp2pService.validateBlockProposal', (_peerId, block) => ({
    [Attributes.SLOT_NUMBER]: block.payload.header.globalVariables.slotNumber.toString(),
  }))
  public async validateBlockProposal(peerId: PeerId, block: BlockProposal): Promise<boolean> {
    const severity = await this.blockProposalValidator.validate(block);
    if (severity) {
      this.peerManager.penalizePeer(peerId, severity);
      return false;
    }

    return true;
  }

  public getPeerScore(peerId: PeerId): number {
    return this.node.services.pubsub.score.score(peerId.toString());
  }

  private async sendToPeers<T extends Gossipable>(message: T) {
    const parent = message.constructor as typeof Gossipable;

    const identifier = await message.p2pMessageIdentifier().then(i => i.toString());
    this.logger.trace(`Sending message ${identifier}`, { p2pMessageIdentifier: identifier });

    const recipientsNum = await this.publishToTopic(parent.p2pTopic, message.toBuffer());
    this.logger.debug(`Sent message ${identifier} to ${recipientsNum} peers`, {
      p2pMessageIdentifier: identifier,
      sourcePeer: this.node.peerId.toString(),
    });
  }

  // Libp2p seems to hang sometimes if new peers are initiating connections.
  private async stopLibP2P() {
    const TIMEOUT_MS = 5000; // 5 seconds timeout
    const timeout = new Promise((_resolve, reject) => {
      setTimeout(() => reject(new Error('Timeout during libp2p.stop()')), TIMEOUT_MS);
    });
    try {
      await Promise.race([this.node.stop(), timeout]);
      this.logger.debug('LibP2P stopped');
    } catch (error) {
      this.logger.error('Error during stop or timeout:', error);
    }
  }
}
