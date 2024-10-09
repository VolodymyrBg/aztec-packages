// An integration test for the p2p client to test req resp protocols
import { MockBlockSource } from '@aztec/archiver/test';
import { type ClientProtocolCircuitVerifier, type WorldStateSynchronizer, mockTx } from '@aztec/circuit-types';
import { EthAddress } from '@aztec/circuits.js';
import { createDebugLogger } from '@aztec/foundation/log';
import { sleep } from '@aztec/foundation/sleep';
import { getRandomPort } from '@aztec/foundation/testing';
import { type AztecKVStore } from '@aztec/kv-store';
import { type DataStoreConfig, openTmpStore } from '@aztec/kv-store/utils';

import { SignableENR } from '@chainsafe/enr';
import { describe, expect, it, jest } from '@jest/globals';
import { multiaddr } from '@multiformats/multiaddr';
import { generatePrivateKey } from 'viem/accounts';

import { createP2PClient } from '../../client/index.js';
import { type P2PClient } from '../../client/p2p_client.js';
import { type P2PConfig, getP2PDefaultConfig } from '../../config.js';
import { type AttestationPool } from '../../mem_pools/attestation_pool/attestation_pool.js';
import { type EpochProofQuotePool } from '../../mem_pools/epoch_proof_quote_pool/epoch_proof_quote_pool.js';
import { type TxPool } from '../../mem_pools/tx_pool/index.js';
import { AlwaysFalseCircuitVerifier, AlwaysTrueCircuitVerifier } from '../../mocks/index.js';
import { convertToMultiaddr } from '../../util.js';
import { AZTEC_ENR_KEY, AZTEC_NET } from '../discV5_service.js';
import { createLibP2PPeerId } from '../index.js';
import { PeerErrorSeverity } from '../peer_scoring.js';

/**
 * Mockify helper for testing purposes.
 */
type Mockify<T> = {
  [P in keyof T]: ReturnType<typeof jest.fn>;
};

const TEST_TIMEOUT = 80000;

function generatePeerIdPrivateKeys(numberOfPeers: number): string[] {
  const peerIdPrivateKeys: string[] = [];
  for (let i = 0; i < numberOfPeers; i++) {
    // magic number is multiaddr prefix: https://multiformats.io/multiaddr/
    peerIdPrivateKeys.push('08021220' + generatePrivateKey().substr(2, 66));
  }
  return peerIdPrivateKeys;
}

const NUMBER_OF_PEERS = 2;

describe('Req Resp p2p client integration', () => {
  let txPool: Mockify<TxPool>;
  let attestationPool: Mockify<AttestationPool>;
  let epochProofQuotePool: Mockify<EpochProofQuotePool>;
  let blockSource: MockBlockSource;
  let kvStore: AztecKVStore;
  let worldStateSynchronizer: WorldStateSynchronizer;
  let proofVerifier: ClientProtocolCircuitVerifier;
  let bootNodePort: number;
  const logger = createDebugLogger('p2p-client-integration-test');

  const getPorts = async (numberOfPeers: number) => {
    const ports = [];
    for (let i = 0; i < numberOfPeers; i++) {
      const port = (await getRandomPort()) || bootNodePort + i + 1;
      ports.push(port);
    }
    return ports;
  };

  const createClients = async (numberOfPeers: number, alwaysTrueVerifier: boolean = true): Promise<P2PClient[]> => {
    const clients: P2PClient[] = [];
    const peerIdPrivateKeys = generatePeerIdPrivateKeys(numberOfPeers);

    const ports = await getPorts(numberOfPeers);

    const peerEnrs = await Promise.all(
      peerIdPrivateKeys.map(async (pk, i) => {
        const peerId = await createLibP2PPeerId(pk);
        const enr = SignableENR.createFromPeerId(peerId);

        const udpAnnounceAddress = `127.0.0.1:${ports[i]}`;
        const publicAddr = multiaddr(convertToMultiaddr(udpAnnounceAddress, 'udp'));

        // ENRS must include the network and a discoverable address (udp for discv5)
        enr.set(AZTEC_ENR_KEY, Uint8Array.from([AZTEC_NET]));
        enr.setLocationMultiaddr(publicAddr);

        return enr.encodeTxt();
      }),
    );

    for (let i = 0; i < numberOfPeers; i++) {
      // Note these bindings are important
      const addr = `127.0.0.1:${ports[i]}`;
      const listenAddr = `0.0.0.0:${ports[i]}`;

      // Filter nodes so that we only dial active peers
      const otherNodes = peerEnrs.filter((_, ind) => ind < i);

      const config: P2PConfig & DataStoreConfig = {
        ...getP2PDefaultConfig(),
        p2pEnabled: true,
        peerIdPrivateKey: peerIdPrivateKeys[i],
        tcpListenAddress: listenAddr, // run on port 0
        udpListenAddress: listenAddr,
        tcpAnnounceAddress: addr,
        udpAnnounceAddress: addr,
        l2QueueSize: 1,
        bootstrapNodes: [...otherNodes],
        blockCheckIntervalMS: 1000,
        peerCheckIntervalMS: 1000,
        transactionProtocol: '',
        minPeerCount: 1,
        maxPeerCount: 10,
        keepProvenTxsInPoolFor: 0,
        queryForIp: false,
        l1ChainId: 31337,
        dataDirectory: undefined,
        l1Contracts: { rollupAddress: EthAddress.ZERO },
      };

      txPool = {
        addTxs: jest.fn(() => {}),
        getTxByHash: jest.fn().mockReturnValue(undefined),
        deleteTxs: jest.fn(),
        getAllTxs: jest.fn().mockReturnValue([]),
        getAllTxHashes: jest.fn().mockReturnValue([]),
        getMinedTxHashes: jest.fn().mockReturnValue([]),
        getPendingTxHashes: jest.fn().mockReturnValue([]),
        getTxStatus: jest.fn().mockReturnValue(undefined),
        markAsMined: jest.fn(),
      };

      attestationPool = {
        addAttestations: jest.fn(),
        deleteAttestations: jest.fn(),
        deleteAttestationsForSlot: jest.fn(),
        getAttestationsForSlot: jest.fn().mockReturnValue(undefined),
      };

      epochProofQuotePool = {
        addQuote: jest.fn(),
        getQuotes: jest.fn().mockReturnValue([]),
        deleteQuotesToEpoch: jest.fn(),
      };

      blockSource = new MockBlockSource();
      proofVerifier = alwaysTrueVerifier ? new AlwaysTrueCircuitVerifier() : new AlwaysFalseCircuitVerifier();
      kvStore = openTmpStore();
      const deps = {
        txPool: txPool as unknown as TxPool,
        attestationPool: attestationPool as unknown as AttestationPool,
        epochProofQuotePool: epochProofQuotePool as unknown as EpochProofQuotePool,
        store: kvStore,
      };
      const client = await createP2PClient(config, blockSource, proofVerifier, worldStateSynchronizer, undefined, deps);

      await client.start();
      clients.push(client);

      logger.info(`Creating client ${i}`);
    }

    logger.info(`Created ${NUMBER_OF_PEERS} clients`);
    await Promise.all(clients.map(client => client.isReady()));
    logger.info(`Clients ready`);
    return clients;
  };

  // Shutdown all test clients
  const shutdown = async (clients: P2PClient[]) => {
    await Promise.all([...clients.map(client => client.stop())]);
    await sleep(1000);
  };

  // TODO: re-enable all in file with https://github.com/AztecProtocol/aztec-packages/issues/8707 is fixed
  it.skip(
    'Returns undefined if unable to find a transaction from another peer',
    async () => {
      // We want to create a set of nodes and request transaction from them
      // Not using a before each as a the wind down is not working as expected
      const clients = await createClients(NUMBER_OF_PEERS);
      const [client1] = clients;

      await sleep(2000);

      // Perform a get tx request from client 1
      const tx = mockTx();
      const txHash = tx.getTxHash();

      const requestedTx = await client1.requestTxByHash(txHash);
      expect(requestedTx).toBeUndefined();

      // await shutdown(clients, bootstrapNode);
      await shutdown(clients);
    },
    TEST_TIMEOUT,
  );

  it.skip(
    'Can request a transaction from another peer',
    async () => {
      // We want to create a set of nodes and request transaction from them
      const clients = await createClients(NUMBER_OF_PEERS);
      const [client1] = clients;

      // Give the nodes time to discover each other
      await sleep(6000);

      // Perform a get tx request from client 1
      const tx = mockTx();
      const txHash = tx.getTxHash();
      // Mock the tx pool to return the tx we are looking for
      txPool.getTxByHash.mockImplementationOnce(() => tx);

      const requestedTx = await client1.requestTxByHash(txHash);

      // Expect the tx to be the returned tx to be the same as the one we mocked
      expect(requestedTx?.toBuffer()).toStrictEqual(tx.toBuffer());

      await shutdown(clients);
    },
    TEST_TIMEOUT,
  );

  it.skip(
    'Will penalize peers that send invalid proofs',
    async () => {
      // We want to create a set of nodes and request transaction from them
      const clients = await createClients(NUMBER_OF_PEERS, /*valid proofs*/ false);
      const [client1, client2] = clients;
      const client2PeerId = (await client2.getEnr()?.peerId())!;

      // Give the nodes time to discover each other
      await sleep(6000);

      const penalizePeerSpy = jest.spyOn((client1 as any).p2pService.peerManager, 'penalizePeer');

      // Perform a get tx request from client 1
      const tx = mockTx();
      const txHash = tx.getTxHash();

      // Return the correct tx with an invalid proof -> active attack
      txPool.getTxByHash.mockImplementationOnce(() => tx);

      const requestedTx = await client1.requestTxByHash(txHash);
      // Even though we got a response, the proof was deemed invalid
      expect(requestedTx).toBeUndefined();

      // Low tolerance error is due to the invalid proof
      expect(penalizePeerSpy).toHaveBeenCalledWith(client2PeerId, PeerErrorSeverity.LowToleranceError);

      await shutdown(clients);
    },
    TEST_TIMEOUT,
  );

  it.skip(
    'Will penalize peers that send the wrong transaction',
    async () => {
      // We want to create a set of nodes and request transaction from them
      const clients = await createClients(NUMBER_OF_PEERS, /*Valid proofs*/ true);
      const [client1, client2] = clients;
      const client2PeerId = (await client2.getEnr()?.peerId())!;

      // Give the nodes time to discover each other
      await sleep(6000);

      const penalizePeerSpy = jest.spyOn((client1 as any).p2pService.peerManager, 'penalizePeer');

      // Perform a get tx request from client 1
      const tx = mockTx();
      const txHash = tx.getTxHash();
      const tx2 = mockTx(420);

      // Return an invalid tx
      txPool.getTxByHash.mockImplementationOnce(() => tx2);

      const requestedTx = await client1.requestTxByHash(txHash);
      // Even though we got a response, the proof was deemed invalid
      expect(requestedTx).toBeUndefined();

      // Received wrong tx
      expect(penalizePeerSpy).toHaveBeenCalledWith(client2PeerId, PeerErrorSeverity.MidToleranceError);

      await shutdown(clients);
    },
    TEST_TIMEOUT,
  );
});
