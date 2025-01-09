import { type Logger, getTimestampRangeForEpoch, retryUntil, sleep } from '@aztec/aztec.js';
// eslint-disable-next-line no-restricted-imports
import { type L1RollupConstants } from '@aztec/circuit-types';
import { Proof } from '@aztec/circuits.js';
import { RootRollupPublicInputs } from '@aztec/circuits.js/rollup';
import { RollupContract } from '@aztec/ethereum/contracts';
import { type Delayer, waitUntilL1Timestamp } from '@aztec/ethereum/test';
import { promiseWithResolvers } from '@aztec/foundation/promise';
import { type TestProverNode } from '@aztec/prover-node/test';
import { type TestL1Publisher, type TestSequencerClient } from '@aztec/sequencer-client/test';

import { jest } from '@jest/globals';
import { type PublicClient } from 'viem';

import { type EndToEndContext, setup } from './fixtures/utils.js';

// Tests building of epochs using fast block times and short epochs.
// Spawns an aztec node and a prover node with fake proofs.
// Sequencer is allowed to build empty blocks.
describe('e2e_epochs', () => {
  let context: EndToEndContext;
  let l1Client: PublicClient;
  let rollup: RollupContract;
  let constants: L1RollupConstants;
  let logger: Logger;
  let proverDelayer: Delayer;
  let sequencerDelayer: Delayer;

  let l2BlockNumber: number = 0;
  let l2ProvenBlockNumber: number = 0;
  let l1BlockNumber: number;
  let handle: NodeJS.Timeout;

  const EPOCH_DURATION_IN_L2_SLOTS = 4;
  const L2_SLOT_DURATION_IN_L1_SLOTS = 2;
  const L1_BLOCK_TIME_IN_S = process.env.L1_BLOCK_TIME ? parseInt(process.env.L1_BLOCK_TIME) : 8;

  beforeEach(async () => {
    // Set up system without any account nor protocol contracts
    // and with faster block times and shorter epochs.
    context = await setup(0, {
      assumeProvenThrough: undefined,
      skipProtocolContracts: true,
      salt: 1,
      aztecEpochDuration: EPOCH_DURATION_IN_L2_SLOTS,
      aztecSlotDuration: L1_BLOCK_TIME_IN_S * L2_SLOT_DURATION_IN_L1_SLOTS,
      ethereumSlotDuration: L1_BLOCK_TIME_IN_S,
      aztecEpochProofClaimWindowInL2Slots: EPOCH_DURATION_IN_L2_SLOTS / 2,
      minTxsPerBlock: 0,
      realProofs: false,
      startProverNode: true,
      // This must be enough so that the tx from the prover is delayed properly,
      // but not so much to hang the sequencer and timeout the teardown
      txPropagationMaxQueryAttempts: 12,
    });

    logger = context.logger;
    l1Client = context.deployL1ContractsValues.publicClient;
    rollup = RollupContract.getFromConfig(context.config);

    // Loop that tracks L1 and L2 block numbers and logs whenever there's a new one.
    // We could refactor this out to an utility if we want to use this in other tests.
    handle = setInterval(async () => {
      const newL1BlockNumber = Number(await l1Client.getBlockNumber({ cacheTime: 0 }));
      if (l1BlockNumber === newL1BlockNumber) {
        return;
      }
      const block = await l1Client.getBlock({ blockNumber: BigInt(newL1BlockNumber), includeTransactions: false });
      const timestamp = block.timestamp;
      l1BlockNumber = newL1BlockNumber;

      let msg = `L1 block ${newL1BlockNumber} mined at ${timestamp}`;

      const newL2BlockNumber = Number(await rollup.getBlockNumber());
      if (l2BlockNumber !== newL2BlockNumber) {
        const epochNumber = await rollup.getEpochNumber(BigInt(newL2BlockNumber));
        msg += ` with new L2 block ${newL2BlockNumber} for epoch ${epochNumber}`;
        l2BlockNumber = newL2BlockNumber;
      }

      const newL2ProvenBlockNumber = Number(await rollup.getProvenBlockNumber());

      if (l2ProvenBlockNumber !== newL2ProvenBlockNumber) {
        const epochNumber = await rollup.getEpochNumber(BigInt(newL2ProvenBlockNumber));
        msg += ` with proof up to L2 block ${newL2ProvenBlockNumber} for epoch ${epochNumber}`;
        l2ProvenBlockNumber = newL2ProvenBlockNumber;
      }
      logger.info(msg);
    }, 200);

    proverDelayer = ((context.proverNode as TestProverNode).publisher as TestL1Publisher).delayer!;
    sequencerDelayer = ((context.sequencer as TestSequencerClient).sequencer.publisher as TestL1Publisher).delayer!;
    expect(proverDelayer).toBeDefined();
    expect(sequencerDelayer).toBeDefined();

    // Constants used for time calculation
    constants = {
      epochDuration: EPOCH_DURATION_IN_L2_SLOTS,
      slotDuration: L1_BLOCK_TIME_IN_S * L2_SLOT_DURATION_IN_L1_SLOTS,
      l1StartBlock: await rollup.getL1StartBlock(),
      l1GenesisTime: await rollup.getL1GenesisTime(),
      ethereumSlotDuration: L1_BLOCK_TIME_IN_S,
    };

    logger.info(`L2 genesis at L1 block ${constants.l1StartBlock} (timestamp ${constants.l1GenesisTime})`);
  });

  afterEach(async () => {
    clearInterval(handle);
    jest.restoreAllMocks();
    await context.teardown();
  });

  /** Waits until the epoch begins (ie until the immediately previous L1 block is mined). */
  const waitUntilEpochStarts = async (epoch: number) => {
    const [start] = getTimestampRangeForEpoch(BigInt(epoch), constants);
    logger.info(`Waiting until L1 timestamp ${start} is reached as the start of epoch ${epoch}`);
    await waitUntilL1Timestamp(l1Client, start - BigInt(L1_BLOCK_TIME_IN_S));
    return start;
  };

  /** Waits until the given L2 block number is mined. */
  const waitUntilL2BlockNumber = async (target: number) => {
    await retryUntil(() => Promise.resolve(target === l2BlockNumber), `Wait until L2 block ${target}`, 60, 0.1);
  };

  /** Waits until the given L2 block number is marked as proven. */
  const waitUntilProvenL2BlockNumber = async (target: number) => {
    await retryUntil(() => Promise.resolve(target === l2ProvenBlockNumber), `Wait proven L2 block ${target}`, 60, 0.1);
  };

  it('does not allow submitting proof after epoch end', async () => {
    await waitUntilEpochStarts(1);
    const blockNumberAtEndOfEpoch0 = Number(await rollup.getBlockNumber());
    logger.info(`Starting epoch 1 after L2 block ${blockNumberAtEndOfEpoch0}`);

    // Hold off prover tx until end of next epoch!
    const [epoch2Start] = getTimestampRangeForEpoch(2n, constants);
    proverDelayer.pauseNextTxUntilTimestamp(epoch2Start);
    logger.info(`Delayed prover tx until epoch 2 starts at ${epoch2Start}`);

    // Wait until the last block of epoch 1 is published and then hold off the sequencer.
    // Note that the tx below will block the sequencer until it times out
    // the txPropagationMaxQueryAttempts until #10824 is fixed.
    await waitUntilL2BlockNumber(blockNumberAtEndOfEpoch0 + EPOCH_DURATION_IN_L2_SLOTS);
    sequencerDelayer.pauseNextTxUntilTimestamp(epoch2Start + BigInt(L1_BLOCK_TIME_IN_S));

    // Next sequencer to publish a block should trigger a rollback to block 1
    await waitUntilL1Timestamp(l1Client, epoch2Start + BigInt(L1_BLOCK_TIME_IN_S));
    expect(await rollup.getBlockNumber()).toEqual(1n);
    expect(await rollup.getSlotNumber()).toEqual(8n);

    // The prover tx should have been rejected, and mined strictly before the one that triggered the rollback
    const lastProverTxHash = proverDelayer.getTxs().at(-1);
    const lastProverTxReceipt = await l1Client.getTransactionReceipt({ hash: lastProverTxHash! });
    expect(lastProverTxReceipt.status).toEqual('reverted');

    const lastL2BlockTxHash = sequencerDelayer.getTxs().at(-1);
    const lastL2BlockTxReceipt = await l1Client.getTransactionReceipt({ hash: lastL2BlockTxHash! });
    expect(lastL2BlockTxReceipt.status).toEqual('success');
    expect(lastL2BlockTxReceipt.blockNumber).toBeGreaterThan(lastProverTxReceipt!.blockNumber);
    logger.info(`Test succeeded`);
  });

  it('submits proof claim alone if there are no txs to build a block', async () => {
    context.sequencer?.updateSequencerConfig({ minTxsPerBlock: 1 });
    await waitUntilEpochStarts(1);
    const blockNumberAtEndOfEpoch0 = Number(await rollup.getBlockNumber());
    logger.info(`Starting epoch 1 after L2 block ${blockNumberAtEndOfEpoch0}`);

    await waitUntilProvenL2BlockNumber(blockNumberAtEndOfEpoch0);
    expect(l2BlockNumber).toEqual(blockNumberAtEndOfEpoch0);
    logger.info(`Test succeeded`);
  });

  it('aborts proving if end of next epoch is reached', async () => {
    // Inject a delay in prover node proving equal to the length of an epoch, to make sure deadline will be hit
    const epochProverManager = (context.proverNode as TestProverNode).prover;
    const originalCreate = epochProverManager.createEpochProver.bind(epochProverManager);
    const finaliseEpochPromise = promiseWithResolvers<void>();
    jest.spyOn(epochProverManager, 'createEpochProver').mockImplementation(() => {
      const prover = originalCreate();
      jest.spyOn(prover, 'finaliseEpoch').mockImplementation(async () => {
        const seconds = L1_BLOCK_TIME_IN_S * L2_SLOT_DURATION_IN_L1_SLOTS * EPOCH_DURATION_IN_L2_SLOTS;
        logger.warn(`Finalise epoch: sleeping ${seconds}s.`);
        await sleep(L1_BLOCK_TIME_IN_S * L2_SLOT_DURATION_IN_L1_SLOTS * EPOCH_DURATION_IN_L2_SLOTS * 1000);
        logger.warn(`Finalise epoch: returning.`);
        finaliseEpochPromise.resolve();
        return { publicInputs: RootRollupPublicInputs.random(), proof: Proof.empty() };
      });
      return prover;
    });

    await waitUntilEpochStarts(1);
    logger.info(`Starting epoch 1`);
    const proverTxCount = proverDelayer.getTxs().length;

    await waitUntilEpochStarts(2);
    logger.info(`Starting epoch 2`);

    // No proof for epoch zero should have landed during epoch one
    expect(l2ProvenBlockNumber).toEqual(0);

    // Wait until the prover job finalises (and a bit more) and check that it aborted and never attempted to submit a tx
    logger.info(`Awaiting finalise epoch`);
    await finaliseEpochPromise.promise;
    await sleep(1000);
    expect(proverDelayer.getTxs().length - proverTxCount).toEqual(0);
  });
});
