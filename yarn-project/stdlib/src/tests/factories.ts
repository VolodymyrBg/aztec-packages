import { makeBlockBlobPublicInputs, makeSpongeBlob } from '@aztec/blob-lib/testing';
import {
  ARCHIVE_HEIGHT,
  AVM_PROOF_LENGTH_IN_FIELDS,
  AZTEC_MAX_EPOCH_DURATION,
  BLOBS_PER_BLOCK,
  CONTRACT_CLASS_LOG_DATA_SIZE_IN_FIELDS,
  FIELDS_PER_BLOB,
  FIXED_DA_GAS,
  FIXED_L2_GAS,
  GeneratorIndex,
  L1_TO_L2_MSG_SUBTREE_SIBLING_PATH_LENGTH,
  MAX_CONTRACT_CLASS_LOGS_PER_TX,
  MAX_ENQUEUED_CALLS_PER_CALL,
  MAX_ENQUEUED_CALLS_PER_TX,
  MAX_KEY_VALIDATION_REQUESTS_PER_CALL,
  MAX_L2_TO_L1_MSGS_PER_CALL,
  MAX_L2_TO_L1_MSGS_PER_TX,
  MAX_NOTE_HASHES_PER_CALL,
  MAX_NOTE_HASHES_PER_TX,
  MAX_NOTE_HASH_READ_REQUESTS_PER_CALL,
  MAX_NULLIFIERS_PER_CALL,
  MAX_NULLIFIERS_PER_TX,
  MAX_NULLIFIER_READ_REQUESTS_PER_CALL,
  MAX_PRIVATE_CALL_STACK_LENGTH_PER_CALL,
  MAX_PRIVATE_LOGS_PER_CALL,
  MAX_PRIVATE_LOGS_PER_TX,
  MAX_PUBLIC_LOGS_PER_TX,
  MAX_TOTAL_PUBLIC_DATA_UPDATE_REQUESTS_PER_TX,
  NESTED_RECURSIVE_PROOF_LENGTH,
  NESTED_RECURSIVE_ROLLUP_HONK_PROOF_LENGTH,
  NOTE_HASH_SUBTREE_SIBLING_PATH_LENGTH,
  NULLIFIER_SUBTREE_SIBLING_PATH_LENGTH,
  NULLIFIER_TREE_HEIGHT,
  NUM_BASE_PARITY_PER_ROOT_PARITY,
  NUM_MSGS_PER_BASE_PARITY,
  PRIVATE_LOG_SIZE_IN_FIELDS,
  PUBLIC_DATA_TREE_HEIGHT,
  PUBLIC_LOG_DATA_SIZE_IN_FIELDS,
  RECURSIVE_PROOF_LENGTH,
  TUBE_PROOF_LENGTH,
  VK_TREE_HEIGHT,
} from '@aztec/constants';
import { type FieldsOf, makeHalfFullTuple, makeTuple } from '@aztec/foundation/array';
import { toBufferBE } from '@aztec/foundation/bigint-buffer';
import { compact } from '@aztec/foundation/collection';
import { SchnorrSignature, poseidon2HashWithSeparator } from '@aztec/foundation/crypto';
import { EthAddress } from '@aztec/foundation/eth-address';
import { Fr, GrumpkinScalar, Point } from '@aztec/foundation/fields';
import type { Bufferable } from '@aztec/foundation/serialize';
import { MembershipWitness } from '@aztec/foundation/trees';

import { FunctionSelector } from '../abi/function_selector.js';
import { ContractStorageRead } from '../avm/contract_storage_read.js';
import { ContractStorageUpdateRequest } from '../avm/contract_storage_update_request.js';
import {
  AvmAccumulatedData,
  AvmAppendTreeHint,
  AvmCircuitInputs,
  AvmCircuitPublicInputs,
  AvmContractClassHint,
  AvmContractInstanceHint,
  AvmEnqueuedCallHint,
  AvmExecutionHints,
  AvmNullifierReadTreeHint,
  AvmNullifierWriteTreeHint,
  AvmPublicDataReadTreeHint,
  AvmPublicDataWriteTreeHint,
  RevertCode,
} from '../avm/index.js';
import { PublicDataHint } from '../avm/public_data_hint.js';
import { PublicDataRead } from '../avm/public_data_read.js';
import { PublicDataWrite } from '../avm/public_data_write.js';
import { AztecAddress } from '../aztec-address/index.js';
import {
  type ContractClassPublic,
  type ContractInstanceWithAddress,
  type ExecutablePrivateFunctionWithMembershipProof,
  type PrivateFunction,
  type PublicFunction,
  SerializableContractInstance,
  type UnconstrainedFunctionWithMembershipProof,
  computeContractClassId,
  computePublicBytecodeCommitment,
} from '../contract/index.js';
import { Gas, GasFees, GasSettings, type GasUsed } from '../gas/index.js';
import type { MerkleTreeReadOperations } from '../interfaces/merkle_tree_operations.js';
import { KeyValidationRequest } from '../kernel/hints/key_validation_request.js';
import { KeyValidationRequestAndGenerator } from '../kernel/hints/key_validation_request_and_generator.js';
import { ReadRequest } from '../kernel/hints/read_request.js';
import { RollupValidationRequests } from '../kernel/hints/rollup_validation_requests.js';
import {
  CombinedConstantData,
  PartialPrivateTailPublicInputsForPublic,
  PartialPrivateTailPublicInputsForRollup,
  PrivateKernelTailCircuitPublicInputs,
  PrivateToAvmAccumulatedData,
  PrivateToAvmAccumulatedDataArrayLengths,
  PrivateToPublicAccumulatedData,
  PrivateToPublicKernelCircuitPublicInputs,
  PrivateToRollupAccumulatedData,
  mergeAccumulatedData,
} from '../kernel/index.js';
import { LogHash, ScopedLogHash } from '../kernel/log_hash.js';
import { NoteHash } from '../kernel/note_hash.js';
import { Nullifier } from '../kernel/nullifier.js';
import { PrivateCallRequest } from '../kernel/private_call_request.js';
import { PrivateCircuitPublicInputs } from '../kernel/private_circuit_public_inputs.js';
import { PrivateLogData } from '../kernel/private_log_data.js';
import { PrivateToRollupKernelCircuitPublicInputs } from '../kernel/private_to_rollup_kernel_circuit_public_inputs.js';
import { CountedPublicCallRequest, PublicCallRequest } from '../kernel/public_call_request.js';
import { PublicKeys, computeAddress } from '../keys/index.js';
import { ContractClassLog } from '../logs/contract_class_log.js';
import { PrivateLog } from '../logs/private_log.js';
import { PublicLog } from '../logs/public_log.js';
import { L2ToL1Message, ScopedL2ToL1Message } from '../messaging/l2_to_l1_message.js';
import { BaseParityInputs } from '../parity/base_parity_inputs.js';
import { ParityPublicInputs } from '../parity/parity_public_inputs.js';
import { RootParityInput } from '../parity/root_parity_input.js';
import { RootParityInputs } from '../parity/root_parity_inputs.js';
import { Proof } from '../proofs/proof.js';
import { ProvingRequestType } from '../proofs/proving_request_type.js';
import { makeRecursiveProof } from '../proofs/recursive_proof.js';
import { AvmProofData } from '../rollup/avm_proof_data.js';
import { BaseOrMergeRollupPublicInputs } from '../rollup/base_or_merge_rollup_public_inputs.js';
import { PrivateBaseRollupHints, PublicBaseRollupHints } from '../rollup/base_rollup_hints.js';
import { BlockMergeRollupInputs } from '../rollup/block_merge_rollup.js';
import { BlockRootOrBlockMergePublicInputs, FeeRecipient } from '../rollup/block_root_or_block_merge_public_inputs.js';
import {
  BlockRootRollupBlobData,
  BlockRootRollupData,
  BlockRootRollupInputs,
  SingleTxBlockRootRollupInputs,
} from '../rollup/block_root_rollup.js';
import { ConstantRollupData } from '../rollup/constant_rollup_data.js';
import { EmptyBlockRootRollupInputs } from '../rollup/empty_block_root_rollup_inputs.js';
import { MergeRollupInputs } from '../rollup/merge_rollup.js';
import { PreviousRollupBlockData } from '../rollup/previous_rollup_block_data.js';
import { PreviousRollupData } from '../rollup/previous_rollup_data.js';
import { PrivateBaseRollupInputs } from '../rollup/private_base_rollup_inputs.js';
import { PrivateTubeData } from '../rollup/private_tube_data.js';
import { PublicBaseRollupInputs } from '../rollup/public_base_rollup_inputs.js';
import { PublicTubeData } from '../rollup/public_tube_data.js';
import { RootRollupInputs, RootRollupPublicInputs } from '../rollup/root_rollup.js';
import { PrivateBaseStateDiffHints } from '../rollup/state_diff_hints.js';
import { AppendOnlyTreeSnapshot } from '../trees/append_only_tree_snapshot.js';
import { NullifierLeafPreimage } from '../trees/nullifier_leaf.js';
import { PublicDataTreeLeaf, PublicDataTreeLeafPreimage } from '../trees/public_data_leaf.js';
import { BlockHeader } from '../tx/block_header.js';
import { CallContext } from '../tx/call_context.js';
import { ContentCommitment, NUM_BYTES_PER_SHA256 } from '../tx/content_commitment.js';
import { FunctionData } from '../tx/function_data.js';
import { GlobalVariables } from '../tx/global_variables.js';
import { MaxBlockNumber } from '../tx/max_block_number.js';
import { PartialStateReference } from '../tx/partial_state_reference.js';
import { makeProcessedTxFromPrivateOnlyTx, makeProcessedTxFromTxWithPublicCalls } from '../tx/processed_tx.js';
import { StateReference } from '../tx/state_reference.js';
import { TreeSnapshots } from '../tx/tree_snapshots.js';
import { TxConstantData } from '../tx/tx_constant_data.js';
import { TxContext } from '../tx/tx_context.js';
import { TxRequest } from '../tx/tx_request.js';
import { RollupTypes, Vector } from '../types/index.js';
import { VerificationKey, VerificationKeyAsFields, VerificationKeyData } from '../vks/verification_key.js';
import { VkWitnessData } from '../vks/vk_witness_data.js';
import { mockTx } from './mocks.js';

/**
 * Creates an arbitrary side effect object with the given seed.
 * @param seed - The seed to use for generating the object.
 * @returns A side effect object.
 */
function makeLogHash(seed: number) {
  return new LogHash(fr(seed), seed + 1, seed + 2);
}

function makeScopedLogHash(seed: number) {
  return new ScopedLogHash(makeLogHash(seed), makeAztecAddress(seed + 3));
}

function makeNoteHash(seed: number) {
  return new NoteHash(fr(seed), seed + 1);
}

function makeNullifier(seed: number) {
  return new Nullifier(fr(seed), seed + 1, fr(seed + 2));
}

function makeContractClassLog(seed: number) {
  // The '* 1' removes the 'Type instantiation is excessively deep and possibly infinite. ts(2589)' err
  return new ContractClassLog(
    makeAztecAddress(seed),
    makeTuple(CONTRACT_CLASS_LOG_DATA_SIZE_IN_FIELDS * 1, fr, seed + 1),
  );
}

function makePrivateLog(seed: number) {
  return new PrivateLog(makeTuple(PRIVATE_LOG_SIZE_IN_FIELDS, fr, seed));
}

function makePrivateLogData(seed: number) {
  return new PrivateLogData(makePrivateLog(seed + 0x100), seed, seed + 1);
}

function makePublicLog(seed: number) {
  return new PublicLog(makeAztecAddress(seed), makeTuple(PUBLIC_LOG_DATA_SIZE_IN_FIELDS, fr, seed + 1));
}

/**
 * Creates an arbitrary tx context with the given seed.
 * @param seed - The seed to use for generating the tx context.
 * @returns A tx context.
 */
export function makeTxContext(seed: number = 1): TxContext {
  // @todo @LHerskind should probably take value for chainId as it will be verified later.
  return new TxContext(new Fr(seed), Fr.ZERO, makeGasSettings());
}

/**
 * Creates a default instance of gas settings. No seed value is used to ensure we allocate a sensible amount of gas for testing.
 */
export function makeGasSettings() {
  return GasSettings.default({ maxFeesPerGas: new GasFees(10, 10) });
}

/**
 * Creates arbitrary selector from the given seed.
 * @param seed - The seed to use for generating the selector.
 * @returns A selector.
 */
export function makeSelector(seed: number): FunctionSelector {
  return new FunctionSelector(seed);
}

function makeReadRequest(n: number): ReadRequest {
  return new ReadRequest(new Fr(BigInt(n)), n + 1);
}

/**
 * Creates arbitrary KeyValidationRequest from the given seed.
 * @param seed - The seed to use for generating the KeyValidationRequest.
 * @returns A KeyValidationRequest.
 */
function makeKeyValidationRequests(seed: number): KeyValidationRequest {
  return new KeyValidationRequest(makePoint(seed), fr(seed + 2));
}

/**
 * Creates arbitrary KeyValidationRequestAndGenerator from the given seed.
 * @param seed - The seed to use for generating the KeyValidationRequestAndGenerator.
 * @returns A KeyValidationRequestAndGenerator.
 */
function makeKeyValidationRequestAndGenerators(seed: number): KeyValidationRequestAndGenerator {
  return new KeyValidationRequestAndGenerator(makeKeyValidationRequests(seed), fr(seed + 4));
}

function makePublicDataWrite(seed = 1) {
  return new PublicDataWrite(fr(seed), fr(seed + 1));
}

/**
 * Creates arbitrary public data read.
 * @param seed - The seed to use for generating the public data read.
 * @returns A public data read.
 */
export function makePublicDataRead(seed = 1): PublicDataRead {
  return new PublicDataRead(fr(seed), fr(seed + 1), 0);
}

/**
 * Creates empty public data read.
 * @returns An empty public data read.
 */
export function makeEmptyPublicDataRead(): PublicDataRead {
  return new PublicDataRead(fr(0), fr(0), 0);
}

/**
 * Creates arbitrary contract storage update request.
 * @param seed - The seed to use for generating the contract storage update request.
 * @returns A contract storage update request.
 */
export function makeContractStorageUpdateRequest(seed = 1): ContractStorageUpdateRequest {
  return new ContractStorageUpdateRequest(fr(seed), fr(seed + 1), seed + 2);
}

/**
 * Creates arbitrary contract storage read.
 * @param seed - The seed to use for generating the contract storage read.
 * @returns A contract storage read.
 */
export function makeContractStorageRead(seed = 1): ContractStorageRead {
  return new ContractStorageRead(fr(seed), fr(seed + 1), seed + 2);
}

export function makeRollupValidationRequests(seed = 1) {
  return new RollupValidationRequests(new MaxBlockNumber(true, new Fr(seed + 0x31415)));
}

function makeTxConstantData(seed = 1) {
  return new TxConstantData(makeHeader(seed), makeTxContext(seed + 0x100), new Fr(seed + 0x200), new Fr(seed + 0x201));
}

export function makeCombinedConstantData(seed = 1): CombinedConstantData {
  return new CombinedConstantData(
    makeHeader(seed),
    makeTxContext(seed + 0x100),
    new Fr(seed + 0x200),
    new Fr(seed + 0x201),
    makeGlobalVariables(seed + 0x300),
  );
}

/**
 * Creates arbitrary accumulated data.
 * @param seed - The seed to use for generating the accumulated data.
 * @returns An accumulated data.
 */
export function makePrivateToRollupAccumulatedData(seed = 1, full = false): PrivateToRollupAccumulatedData {
  const tupleGenerator = full ? makeTuple : makeHalfFullTuple;

  return new PrivateToRollupAccumulatedData(
    tupleGenerator(MAX_NOTE_HASHES_PER_TX, fr, seed + 0x120, Fr.zero),
    tupleGenerator(MAX_NULLIFIERS_PER_TX, fr, seed + 0x200, Fr.zero),
    tupleGenerator(MAX_L2_TO_L1_MSGS_PER_TX, makeScopedL2ToL1Message, seed + 0x600, ScopedL2ToL1Message.empty),
    tupleGenerator(MAX_PRIVATE_LOGS_PER_TX, makePrivateLog, seed + 0x700, PrivateLog.empty),
    tupleGenerator(MAX_CONTRACT_CLASS_LOGS_PER_TX, makeScopedLogHash, seed + 0xa00, ScopedLogHash.empty), // contract class logs
  );
}

export function makePrivateToPublicAccumulatedData(seed = 1) {
  return new PrivateToPublicAccumulatedData(
    makeTuple(MAX_NOTE_HASHES_PER_TX, fr, seed),
    makeTuple(MAX_NULLIFIERS_PER_TX, fr, seed + 0x100),
    makeTuple(MAX_L2_TO_L1_MSGS_PER_TX, makeScopedL2ToL1Message, seed + 0x200),
    makeTuple(MAX_PRIVATE_LOGS_PER_TX, makePrivateLog, seed + 0x700),
    makeTuple(MAX_CONTRACT_CLASS_LOGS_PER_TX, makeScopedLogHash, seed + 0x900),
    makeTuple(MAX_ENQUEUED_CALLS_PER_TX, makePublicCallRequest, seed + 0x500),
  );
}

function makePrivateToAvmAccumulatedData(seed = 1) {
  return new PrivateToAvmAccumulatedData(
    makeTuple(MAX_NOTE_HASHES_PER_TX, fr, seed),
    makeTuple(MAX_NULLIFIERS_PER_TX, fr, seed + 0x100),
    makeTuple(MAX_L2_TO_L1_MSGS_PER_TX, makeScopedL2ToL1Message, seed + 0x200),
  );
}

function makePrivateToAvmAccumulatedDataArrayLengths(seed = 1) {
  return new PrivateToAvmAccumulatedDataArrayLengths(seed, seed + 1, seed + 2);
}

function makeAvmAccumulatedData(seed = 1) {
  return new AvmAccumulatedData(
    makeTuple(MAX_NOTE_HASHES_PER_TX, fr, seed),
    makeTuple(MAX_NULLIFIERS_PER_TX, fr, seed + 0x100),
    makeTuple(MAX_L2_TO_L1_MSGS_PER_TX, makeScopedL2ToL1Message, seed + 0x200),
    makeTuple(MAX_PUBLIC_LOGS_PER_TX, makePublicLog, seed + 0x300),
    makeTuple(MAX_TOTAL_PUBLIC_DATA_UPDATE_REQUESTS_PER_TX, makePublicDataWrite, seed + 0x400),
  );
}

export function makeGas(seed = 1) {
  return new Gas(seed, seed + 1);
}

/**
 * Creates arbitrary call context.
 * @param seed - The seed to use for generating the call context.
 * @returns A call context.
 */
export function makeCallContext(seed = 0, overrides: Partial<FieldsOf<CallContext>> = {}): CallContext {
  return CallContext.from({
    msgSender: makeAztecAddress(seed),
    contractAddress: makeAztecAddress(seed + 1),
    functionSelector: makeSelector(seed + 3),
    isStaticCall: false,
    ...overrides,
  });
}

/**
 * Creates arbitrary private kernel tail circuit public inputs.
 * @param seed - The seed to use for generating the kernel circuit public inputs.
 * @returns Private kernel tail circuit public inputs.
 */
export function makePrivateKernelTailCircuitPublicInputs(
  seed = 1,
  isForPublic = true,
): PrivateKernelTailCircuitPublicInputs {
  const forPublic = isForPublic
    ? new PartialPrivateTailPublicInputsForPublic(
        makePrivateToPublicAccumulatedData(seed + 0x100),
        makePrivateToPublicAccumulatedData(seed + 0x200),
        makePublicCallRequest(seed + 0x400),
      )
    : undefined;
  const forRollup = !isForPublic
    ? new PartialPrivateTailPublicInputsForRollup(makePrivateToRollupAccumulatedData(seed + 0x100))
    : undefined;
  return new PrivateKernelTailCircuitPublicInputs(
    makeTxConstantData(seed + 0x300),
    makeRollupValidationRequests(seed + 0x500),
    makeGas(seed + 0x600),
    makeAztecAddress(seed + 0x700),
    forPublic,
    forRollup,
  );
}

function makePrivateToPublicKernelCircuitPublicInputs(seed = 1) {
  return new PrivateToPublicKernelCircuitPublicInputs(
    makeTxConstantData(seed),
    makeRollupValidationRequests(seed + 0x100),
    makePrivateToPublicAccumulatedData(seed + 0x200),
    makePrivateToPublicAccumulatedData(seed + 0x300),
    makePublicCallRequest(seed + 0x400),
    makeGas(seed + 0x500),
    makeAztecAddress(seed + 0x600),
  );
}

/**
 * Creates arbitrary public kernel circuit public inputs.
 * @param seed - The seed to use for generating the kernel circuit public inputs.
 * @returns Public kernel circuit public inputs.
 */
export function makePrivateToRollupKernelCircuitPublicInputs(
  seed = 1,
  fullAccumulatedData = true,
): PrivateToRollupKernelCircuitPublicInputs {
  return new PrivateToRollupKernelCircuitPublicInputs(
    makeTxConstantData(seed + 0x100),
    makeRollupValidationRequests(seed),
    makePrivateToRollupAccumulatedData(seed, fullAccumulatedData),
    makeGas(seed + 0x600),
    makeAztecAddress(seed + 0x700),
  );
}

function makeAvmCircuitPublicInputs(seed = 1) {
  return new AvmCircuitPublicInputs(
    makeGlobalVariables(seed),
    makeTreeSnapshots(seed + 0x10),
    makeGas(seed + 0x20),
    makeGasSettings(),
    makeAztecAddress(seed + 0x40),
    makeTuple(MAX_ENQUEUED_CALLS_PER_TX, makePublicCallRequest, seed + 0x100),
    makeTuple(MAX_ENQUEUED_CALLS_PER_TX, makePublicCallRequest, seed + 0x200),
    makePublicCallRequest(seed + 0x300),
    makePrivateToAvmAccumulatedDataArrayLengths(seed + 0x400),
    makePrivateToAvmAccumulatedDataArrayLengths(seed + 0x410),
    makePrivateToAvmAccumulatedData(seed + 0x500),
    makePrivateToAvmAccumulatedData(seed + 0x600),
    makeTreeSnapshots(seed + 0x700),
    makeGas(seed + 0x750),
    makeAvmAccumulatedData(seed + 0x800),
    fr(seed + 0x900),
    false,
  );
}

function makeSiblingPath<N extends number>(seed: number, size: N) {
  return makeTuple(size, fr, seed);
}

/**
 * Creates arbitrary/mocked membership witness where the sibling paths is an array of fields in an ascending order starting from `start`.
 * @param size - The size of the membership witness.
 * @param start - The start of the membership witness.
 * @returns A membership witness.
 */
export function makeMembershipWitness<N extends number>(size: N, start: number): MembershipWitness<N> {
  return new MembershipWitness(size, BigInt(start), makeSiblingPath(start, size));
}

/**
 * Creates arbitrary/mocked verification key in fields format.
 * @returns A verification key as fields object
 */
export function makeVerificationKeyAsFields(size: number): VerificationKeyAsFields {
  return VerificationKeyAsFields.makeFake(size);
}

/**
 * Creates arbitrary/mocked verification key.
 * @returns A verification key object
 */
export function makeVerificationKey(): VerificationKey {
  return VerificationKey.makeFake();
}

/**
 * Creates an arbitrary point in a curve.
 * @param seed - Seed to generate the point values.
 * @returns A point.
 */
export function makePoint(seed = 1): Point {
  return new Point(fr(seed), fr(seed + 1), false);
}

/**
 * Creates an arbitrary grumpkin scalar.
 * @param seed - Seed to generate the values.
 * @returns A GrumpkinScalar.
 */
export function makeGrumpkinScalar(seed = 1): GrumpkinScalar {
  return GrumpkinScalar.fromHighLow(fr(seed), fr(seed + 1));
}

/**
 * Makes arbitrary proof.
 * @param seed - The seed to use for generating/mocking the proof.
 * @returns A proof.
 */
export function makeProof(seed = 1) {
  return new Proof(Buffer.alloc(16, seed), 0);
}

function makePrivateCallRequest(seed = 1): PrivateCallRequest {
  return new PrivateCallRequest(makeCallContext(seed + 0x1), fr(seed + 0x3), fr(seed + 0x4), seed + 0x10, seed + 0x11);
}

export function makePublicCallRequest(seed = 1) {
  return new PublicCallRequest(
    makeAztecAddress(seed),
    makeAztecAddress(seed + 1),
    makeSelector(seed + 2),
    false,
    fr(seed + 0x3),
  );
}

function makeCountedPublicCallRequest(seed = 1) {
  return new CountedPublicCallRequest(makePublicCallRequest(seed), seed + 0x100);
}

/**
 * Makes arbitrary tx request.
 * @param seed - The seed to use for generating the tx request.
 * @returns A tx request.
 */
export function makeTxRequest(seed = 1): TxRequest {
  return TxRequest.from({
    origin: makeAztecAddress(seed),
    functionData: new FunctionData(makeSelector(seed + 0x100), /*isPrivate=*/ true),
    argsHash: fr(seed + 0x200),
    txContext: makeTxContext(seed + 0x400),
  });
}

/**
 * Makes arbitrary private circuit public inputs.
 * @param seed - The seed to use for generating the private circuit public inputs.
 * @returns A private circuit public inputs.
 */
export function makePrivateCircuitPublicInputs(seed = 0): PrivateCircuitPublicInputs {
  return PrivateCircuitPublicInputs.from({
    maxBlockNumber: new MaxBlockNumber(true, new Fr(seed + 0x31415)),
    callContext: makeCallContext(seed, { isStaticCall: true }),
    argsHash: fr(seed + 0x100),
    returnsHash: fr(seed + 0x200),
    minRevertibleSideEffectCounter: fr(0),
    noteHashReadRequests: makeTuple(MAX_NOTE_HASH_READ_REQUESTS_PER_CALL, makeReadRequest, seed + 0x300),
    nullifierReadRequests: makeTuple(MAX_NULLIFIER_READ_REQUESTS_PER_CALL, makeReadRequest, seed + 0x310),
    keyValidationRequestsAndGenerators: makeTuple(
      MAX_KEY_VALIDATION_REQUESTS_PER_CALL,
      makeKeyValidationRequestAndGenerators,
      seed + 0x320,
    ),
    noteHashes: makeTuple(MAX_NOTE_HASHES_PER_CALL, makeNoteHash, seed + 0x400),
    nullifiers: makeTuple(MAX_NULLIFIERS_PER_CALL, makeNullifier, seed + 0x500),
    privateCallRequests: makeTuple(MAX_PRIVATE_CALL_STACK_LENGTH_PER_CALL, makePrivateCallRequest, seed + 0x600),
    publicCallRequests: makeTuple(MAX_ENQUEUED_CALLS_PER_CALL, makeCountedPublicCallRequest, seed + 0x700),
    publicTeardownCallRequest: makePublicCallRequest(seed + 0x800),
    l2ToL1Msgs: makeTuple(MAX_L2_TO_L1_MSGS_PER_CALL, makeL2ToL1Message, seed + 0x800),
    privateLogs: makeTuple(MAX_PRIVATE_LOGS_PER_CALL, makePrivateLogData, seed + 0x875),
    contractClassLogsHashes: makeTuple(MAX_CONTRACT_CLASS_LOGS_PER_TX, makeLogHash, seed + 0xa00),
    startSideEffectCounter: fr(seed + 0x849),
    endSideEffectCounter: fr(seed + 0x850),
    historicalHeader: makeHeader(seed + 0xd00, undefined),
    txContext: makeTxContext(seed + 0x1400),
    isFeePayer: false,
  });
}

export function makeGlobalVariables(seed = 1, overrides: Partial<FieldsOf<GlobalVariables>> = {}): GlobalVariables {
  return GlobalVariables.from({
    chainId: new Fr(seed),
    version: new Fr(seed + 1),
    blockNumber: new Fr(seed + 2),
    slotNumber: new Fr(seed + 3),
    timestamp: new Fr(seed + 4),
    coinbase: EthAddress.fromField(new Fr(seed + 5)),
    feeRecipient: AztecAddress.fromField(new Fr(seed + 6)),
    gasFees: new GasFees(new Fr(seed + 7), new Fr(seed + 8)),
    ...compact(overrides),
  });
}

export function makeGasFees(seed = 1) {
  return new GasFees(fr(seed), fr(seed + 1));
}

export function makeFeeRecipient(seed = 1) {
  return new FeeRecipient(EthAddress.fromField(fr(seed)), fr(seed + 1));
}

/**
 * Makes constant base rollup data.
 * @param seed - The seed to use for generating the constant base rollup data.
 * @param blockNumber - The block number to use for generating the global variables.
 * @returns A constant base rollup data.
 */
export function makeConstantRollupData(
  seed = 1,
  globalVariables: GlobalVariables | undefined = undefined,
): ConstantRollupData {
  return ConstantRollupData.from({
    lastArchive: makeAppendOnlyTreeSnapshot(seed + 0x300),
    vkTreeRoot: fr(seed + 0x401),
    protocolContractTreeRoot: fr(seed + 0x402),
    globalVariables: globalVariables ?? makeGlobalVariables(seed + 0x500),
  });
}

export function makeScopedL2ToL1Message(seed = 1): ScopedL2ToL1Message {
  return new ScopedL2ToL1Message(makeL2ToL1Message(seed), makeAztecAddress(seed + 3));
}

/**
 * Makes arbitrary append only tree snapshot.
 * @param seed - The seed to use for generating the append only tree snapshot.
 * @returns An append only tree snapshot.
 */
export function makeAppendOnlyTreeSnapshot(seed = 1): AppendOnlyTreeSnapshot {
  return new AppendOnlyTreeSnapshot(fr(seed), seed);
}

/**
 * Makes arbitrary eth address.
 * @param seed - The seed to use for generating the eth address.
 * @returns An eth address.
 */
export function makeEthAddress(seed = 1): EthAddress {
  return EthAddress.fromField(fr(seed));
}

/**
 * Creates a buffer of a given size filled with a given value.
 * @param size - The size of the buffer to create.
 * @param fill - The value to fill the buffer with.
 * @returns A buffer of a given size filled with a given value.
 */
export function makeBytes(size = 32, fill = 1): Buffer {
  return Buffer.alloc(size, fill);
}

/**
 * Makes arbitrary aztec address.
 * @param seed - The seed to use for generating the aztec address.
 * @returns An aztec address.
 */
export function makeAztecAddress(seed = 1): AztecAddress {
  return AztecAddress.fromField(fr(seed));
}

/**
 * Makes arbitrary Schnorr signature.
 * @param seed - The seed to use for generating the Schnorr signature.
 * @returns A Schnorr signature.
 */
export function makeSchnorrSignature(seed = 1): SchnorrSignature {
  return new SchnorrSignature(Buffer.alloc(SchnorrSignature.SIZE, seed));
}

/**
 * Makes arbitrary base or merge rollup circuit public inputs.
 * @param seed - The seed to use for generating the base rollup circuit public inputs.
 * @param blockNumber - The block number to use for generating the base rollup circuit public inputs.
 * @returns A base or merge rollup circuit public inputs.
 */
export function makeBaseOrMergeRollupPublicInputs(
  seed = 0,
  globalVariables: GlobalVariables | undefined = undefined,
): BaseOrMergeRollupPublicInputs {
  return new BaseOrMergeRollupPublicInputs(
    RollupTypes.Base,
    1,
    makeConstantRollupData(seed + 0x200, globalVariables),
    makePartialStateReference(seed + 0x300),
    makePartialStateReference(seed + 0x400),
    makeSpongeBlob(seed + 0x500),
    makeSpongeBlob(seed + 0x600),
    fr(seed + 0x901),
    fr(seed + 0x902),
    fr(seed + 0x903),
  );
}

/**
 * Makes arbitrary block merge or block root rollup circuit public inputs.
 * @param seed - The seed to use for generating the block merge or block root rollup circuit public inputs.
 * @param blockNumber - The block number to use for generating the block merge or block root rollup circuit public inputs.
 * @returns A block merge or block root rollup circuit public inputs.
 */
export function makeBlockRootOrBlockMergeRollupPublicInputs(
  seed = 0,
  globalVariables: GlobalVariables | undefined = undefined,
): BlockRootOrBlockMergePublicInputs {
  return new BlockRootOrBlockMergePublicInputs(
    makeAppendOnlyTreeSnapshot(seed + 0x200),
    makeAppendOnlyTreeSnapshot(seed + 0x300),
    fr(seed + 0x400),
    fr(seed + 0x500),
    globalVariables ?? makeGlobalVariables(seed + 0x501),
    globalVariables ?? makeGlobalVariables(seed + 0x502),
    fr(seed + 0x600),
    makeTuple(AZTEC_MAX_EPOCH_DURATION, () => makeFeeRecipient(seed), 0x700),
    fr(seed + 0x800),
    fr(seed + 0x801),
    fr(seed + 0x900),
    makeTuple(AZTEC_MAX_EPOCH_DURATION, () => makeBlockBlobPublicInputs(seed), 0x100),
  );
}

/**
 * Makes arbitrary previous rollup data.
 * @param seed - The seed to use for generating the previous rollup data.
 * @param globalVariables - The global variables to use when generating the previous rollup data.
 * @returns A previous rollup data.
 */
export function makePreviousRollupData(
  seed = 0,
  globalVariables: GlobalVariables | undefined = undefined,
): PreviousRollupData {
  return new PreviousRollupData(
    makeBaseOrMergeRollupPublicInputs(seed, globalVariables),
    makeRecursiveProof<typeof NESTED_RECURSIVE_ROLLUP_HONK_PROOF_LENGTH>(
      NESTED_RECURSIVE_ROLLUP_HONK_PROOF_LENGTH,
      seed + 0x50,
    ),
    VerificationKeyAsFields.makeFakeHonk(),
    makeMembershipWitness(VK_TREE_HEIGHT, seed + 0x120),
  );
}

/**
 * Makes arbitrary previous rollup block data.
 * @param seed - The seed to use for generating the previous rollup block data.
 * @param globalVariables - The global variables to use when generating the previous rollup block data.
 * @returns A previous rollup block data.
 */
export function makePreviousRollupBlockData(
  seed = 0,
  globalVariables: GlobalVariables | undefined = undefined,
): PreviousRollupBlockData {
  return new PreviousRollupBlockData(
    makeBlockRootOrBlockMergeRollupPublicInputs(seed, globalVariables),
    makeRecursiveProof<typeof NESTED_RECURSIVE_ROLLUP_HONK_PROOF_LENGTH>(
      NESTED_RECURSIVE_ROLLUP_HONK_PROOF_LENGTH,
      seed + 0x50,
    ),
    VerificationKeyAsFields.makeFakeHonk(),
    makeMembershipWitness(VK_TREE_HEIGHT, seed + 0x120),
  );
}

/**
 * Makes root rollup inputs.
 * @param seed - The seed to use for generating the root rollup inputs.
 * @param globalVariables - The global variables to use.
 * @returns A root rollup inputs.
 */
export function makeRootRollupInputs(seed = 0, globalVariables?: GlobalVariables): RootRollupInputs {
  return new RootRollupInputs(
    [makePreviousRollupBlockData(seed, globalVariables), makePreviousRollupBlockData(seed + 0x1000, globalVariables)],
    fr(seed + 0x2000),
  );
}

function makeBlockRootRollupData(seed = 0) {
  return new BlockRootRollupData(
    makeRootParityInput<typeof NESTED_RECURSIVE_PROOF_LENGTH>(NESTED_RECURSIVE_PROOF_LENGTH, seed + 0x2000),
    makeTuple(L1_TO_L2_MSG_SUBTREE_SIBLING_PATH_LENGTH, fr, 0x2100),
    makeTuple(ARCHIVE_HEIGHT, fr, 0x2200),
    makeHeader(seed + 0x2300),
    fr(seed + 0x2400),
  );
}

function makeBlockRootRollupBlobData(seed = 0) {
  return new BlockRootRollupBlobData(
    makeTuple(FIELDS_PER_BLOB * BLOBS_PER_BLOCK, fr, 0x2500),
    makeTuple(BLOBS_PER_BLOCK, () => makeTuple(2, fr, 0x2600)),
    fr(seed + 0x2700),
  );
}

/**
 * Makes block root rollup inputs.
 * @param seed - The seed to use for generating the root rollup inputs.
 * @param globalVariables - The global variables to use.
 * @returns A block root rollup inputs.
 */
export function makeBlockRootRollupInputs(seed = 0, globalVariables?: GlobalVariables): BlockRootRollupInputs {
  return new BlockRootRollupInputs(
    [makePreviousRollupData(seed, globalVariables), makePreviousRollupData(seed + 0x1000, globalVariables)],
    makeBlockRootRollupData(seed + 0x2000),
    makeBlockRootRollupBlobData(seed + 0x4000),
  );
}

export function makeSingleTxBlockRootRollupInputs(seed = 0, globalVariables?: GlobalVariables) {
  return new SingleTxBlockRootRollupInputs(
    [makePreviousRollupData(seed, globalVariables)],
    makeBlockRootRollupData(seed + 0x2000),
    makeBlockRootRollupBlobData(seed + 0x4000),
  );
}

/**
 * Makes empty block root rollup inputs.
 * @param seed - The seed to use for generating the root rollup inputs.
 * @param globalVariables - The global variables to use.
 * @returns A block root rollup inputs.
 */
export function makeEmptyBlockRootRollupInputs(
  seed = 0,
  globalVariables?: GlobalVariables,
): EmptyBlockRootRollupInputs {
  return new EmptyBlockRootRollupInputs(
    makeBlockRootRollupData(seed + 0x1000),
    makeConstantRollupData(0x2500, globalVariables),
    true,
  );
}

export function makeRootParityInput<PROOF_LENGTH extends number>(
  proofSize: PROOF_LENGTH,
  seed = 0,
): RootParityInput<PROOF_LENGTH> {
  return new RootParityInput<PROOF_LENGTH>(
    makeRecursiveProof<PROOF_LENGTH>(proofSize, seed),
    VerificationKeyAsFields.makeFake(seed + 0x100),
    makeTuple(VK_TREE_HEIGHT, fr, 0x200),
    makeParityPublicInputs(seed + 0x300),
  );
}

export function makeParityPublicInputs(seed = 0): ParityPublicInputs {
  return new ParityPublicInputs(
    new Fr(BigInt(seed + 0x200)),
    new Fr(BigInt(seed + 0x300)),
    new Fr(BigInt(seed + 0x400)),
  );
}

export function makeBaseParityInputs(seed = 0): BaseParityInputs {
  return new BaseParityInputs(makeTuple(NUM_MSGS_PER_BASE_PARITY, fr, seed + 0x3000), new Fr(seed + 0x4000));
}

export function makeRootParityInputs(seed = 0): RootParityInputs {
  return new RootParityInputs(
    makeTuple(
      NUM_BASE_PARITY_PER_ROOT_PARITY,
      () => makeRootParityInput<typeof RECURSIVE_PROOF_LENGTH>(RECURSIVE_PROOF_LENGTH),
      seed + 0x4100,
    ),
  );
}

/**
 * Makes root rollup public inputs.
 * @param seed - The seed to use for generating the root rollup public inputs.
 * @param blockNumber - The block number to use in the global variables of a header.
 * @returns A root rollup public inputs.
 */
export function makeRootRollupPublicInputs(seed = 0): RootRollupPublicInputs {
  return new RootRollupPublicInputs(
    makeAppendOnlyTreeSnapshot(seed + 0x200),
    makeAppendOnlyTreeSnapshot(seed + 0x300),
    fr(seed + 0x400),
    fr(seed + 0x500),
    fr(seed + 0x600),
    fr(seed + 0x700),
    fr(seed + 0x800),
    makeTuple(AZTEC_MAX_EPOCH_DURATION, () => makeFeeRecipient(seed), 0x900),
    fr(seed + 0x100),
    fr(seed + 0x101),
    fr(seed + 0x200),
    makeTuple(AZTEC_MAX_EPOCH_DURATION, () => makeBlockBlobPublicInputs(seed), 0x300),
  );
}

/**
 * Makes content commitment
 */
export function makeContentCommitment(seed = 0): ContentCommitment {
  return new ContentCommitment(
    new Fr(seed),
    toBufferBE(BigInt(seed + 0x100), NUM_BYTES_PER_SHA256),
    toBufferBE(BigInt(seed + 0x200), NUM_BYTES_PER_SHA256),
    toBufferBE(BigInt(seed + 0x300), NUM_BYTES_PER_SHA256),
  );
}

/**
 * Makes header.
 */
export function makeHeader(
  seed = 0,
  blockNumber: number | undefined = undefined,
  slotNumber: number | undefined = undefined,
): BlockHeader {
  return new BlockHeader(
    makeAppendOnlyTreeSnapshot(seed + 0x100),
    makeContentCommitment(seed + 0x200),
    makeStateReference(seed + 0x600),
    makeGlobalVariables((seed += 0x700), {
      ...(blockNumber ? { blockNumber: new Fr(blockNumber) } : {}),
      ...(slotNumber ? { slotNumber: new Fr(slotNumber) } : {}),
    }),
    fr(seed + 0x800),
    fr(seed + 0x900),
  );
}

/**
 * Makes arbitrary state reference.
 * @param seed - The seed to use for generating the state reference.
 * @returns A state reference.
 */
export function makeStateReference(seed = 0): StateReference {
  return new StateReference(makeAppendOnlyTreeSnapshot(seed), makePartialStateReference(seed + 1));
}

function makeTreeSnapshots(seed = 0) {
  return new TreeSnapshots(
    makeAppendOnlyTreeSnapshot(seed),
    makeAppendOnlyTreeSnapshot(seed + 0x10),
    makeAppendOnlyTreeSnapshot(seed + 0x20),
    makeAppendOnlyTreeSnapshot(seed + 0x30),
  );
}

/**
 * Makes arbitrary L2 to L1 message.
 * @param seed - The seed to use for generating the state reference.
 * @returns L2 to L1 message.
 */
export function makeL2ToL1Message(seed = 0): L2ToL1Message {
  const recipient = EthAddress.fromField(new Fr(seed));
  const content = new Fr(seed + 1);

  return new L2ToL1Message(recipient, content, seed + 2);
}

/**
 * Makes arbitrary partial state reference.
 * @param seed - The seed to use for generating the partial state reference.
 * @returns A partial state reference.
 */
export function makePartialStateReference(seed = 0): PartialStateReference {
  return new PartialStateReference(
    makeAppendOnlyTreeSnapshot(seed),
    makeAppendOnlyTreeSnapshot(seed + 1),
    makeAppendOnlyTreeSnapshot(seed + 2),
  );
}

/**
 * Makes arbitrary merge rollup inputs.
 * @param seed - The seed to use for generating the merge rollup inputs.
 * @returns A merge rollup inputs.
 */
export function makeMergeRollupInputs(seed = 0): MergeRollupInputs {
  return new MergeRollupInputs([makePreviousRollupData(seed), makePreviousRollupData(seed + 0x1000)]);
}

/**
 * Makes arbitrary block merge rollup inputs.
 * @param seed - The seed to use for generating the merge rollup inputs.
 * @returns A block merge rollup inputs.
 */
export function makeBlockMergeRollupInputs(seed = 0): BlockMergeRollupInputs {
  return new BlockMergeRollupInputs([makePreviousRollupBlockData(seed), makePreviousRollupBlockData(seed + 0x1000)]);
}

/**
 * Makes arbitrary public data tree leaves.
 * @param seed - The seed to use for generating the public data tree leaf.
 * @returns A public data tree leaf.
 */
export function makePublicDataTreeLeaf(seed = 0): PublicDataTreeLeaf {
  return new PublicDataTreeLeaf(new Fr(seed), new Fr(seed + 1));
}

/**
 * Makes arbitrary public data tree leaf preimages.
 * @param seed - The seed to use for generating the public data tree leaf preimage.
 * @returns A public data tree leaf preimage.
 */
export function makePublicDataTreeLeafPreimage(seed = 0): PublicDataTreeLeafPreimage {
  return new PublicDataTreeLeafPreimage(new Fr(seed), new Fr(seed + 1), new Fr(seed + 2), BigInt(seed + 3));
}

/**
 * Creates an instance of PrivateBaseStateDiffHints with arbitrary values based on the provided seed.
 * @param seed - The seed to use for generating the hints.
 * @returns A PrivateBaseStateDiffHints object.
 */
export function makePrivateBaseStateDiffHints(seed = 1): PrivateBaseStateDiffHints {
  const nullifierPredecessorPreimages = makeTuple(
    MAX_NULLIFIERS_PER_TX,
    x => new NullifierLeafPreimage(fr(x), fr(x + 0x100), BigInt(x + 0x200)),
    seed + 0x1000,
  );

  const nullifierPredecessorMembershipWitnesses = makeTuple(
    MAX_NULLIFIERS_PER_TX,
    x => makeMembershipWitness(NULLIFIER_TREE_HEIGHT, x),
    seed + 0x2000,
  );

  const sortedNullifiers = makeTuple(MAX_NULLIFIERS_PER_TX, fr, seed + 0x3000);

  const sortedNullifierIndexes = makeTuple(MAX_NULLIFIERS_PER_TX, i => i, seed + 0x4000);

  const noteHashSubtreeSiblingPath = makeTuple(NOTE_HASH_SUBTREE_SIBLING_PATH_LENGTH, fr, seed + 0x5000);

  const nullifierSubtreeSiblingPath = makeTuple(NULLIFIER_SUBTREE_SIBLING_PATH_LENGTH, fr, seed + 0x6000);

  const feeWriteLowLeafPreimage = makePublicDataTreeLeafPreimage(seed + 0x7000);
  const feeWriteLowLeafMembershipWitness = makeMembershipWitness(PUBLIC_DATA_TREE_HEIGHT, seed + 0x8000);
  const feeWriteSiblingPath = makeTuple(PUBLIC_DATA_TREE_HEIGHT, fr, seed + 0x9000);

  return new PrivateBaseStateDiffHints(
    nullifierPredecessorPreimages,
    nullifierPredecessorMembershipWitnesses,
    sortedNullifiers,
    sortedNullifierIndexes,
    noteHashSubtreeSiblingPath,
    nullifierSubtreeSiblingPath,
    feeWriteLowLeafPreimage,
    feeWriteLowLeafMembershipWitness,
    feeWriteSiblingPath,
  );
}

function makeVkWitnessData(seed = 1) {
  return new VkWitnessData(VerificationKeyData.makeFakeHonk(), seed, makeTuple(VK_TREE_HEIGHT, fr, seed + 0x100));
}

function makePrivateTubeData(seed = 1, kernelPublicInputs?: PrivateToRollupKernelCircuitPublicInputs) {
  return new PrivateTubeData(
    kernelPublicInputs ?? makePrivateToRollupKernelCircuitPublicInputs(seed, true),
    makeRecursiveProof<typeof TUBE_PROOF_LENGTH>(TUBE_PROOF_LENGTH, seed + 0x100),
    makeVkWitnessData(seed + 0x200),
  );
}

function makePrivateBaseRollupHints(seed = 1) {
  const start = makePartialStateReference(seed + 0x100);

  const startSpongeBlob = makeSpongeBlob(seed + 0x200);

  const stateDiffHints = makePrivateBaseStateDiffHints(seed + 0x600);

  const archiveRootMembershipWitness = makeMembershipWitness(ARCHIVE_HEIGHT, seed + 0x9000);

  const contractClassLogsPreimages = makeTuple(MAX_CONTRACT_CLASS_LOGS_PER_TX, makeContractClassLog, seed + 0x800);

  const constants = makeConstantRollupData(0x100);

  const feePayerFeeJuiceBalanceReadHint = PublicDataHint.empty();

  return PrivateBaseRollupHints.from({
    start,
    startSpongeBlob,
    stateDiffHints,
    feePayerFeeJuiceBalanceReadHint,
    archiveRootMembershipWitness,
    contractClassLogsPreimages,
    constants,
  });
}

function makePublicBaseRollupHints(seed = 1) {
  const startSpongeBlob = makeSpongeBlob(seed + 0x200);

  const archiveRootMembershipWitness = makeMembershipWitness(ARCHIVE_HEIGHT, seed + 0x9000);

  const contractClassLogsPreimages = makeTuple(MAX_CONTRACT_CLASS_LOGS_PER_TX, makeContractClassLog, seed + 0x800);

  const constants = makeConstantRollupData(0x100);

  return PublicBaseRollupHints.from({
    startSpongeBlob,
    archiveRootMembershipWitness,
    contractClassLogsPreimages,
    constants,
  });
}

export function makePrivateBaseRollupInputs(seed = 0) {
  const tubeData = makePrivateTubeData(seed);
  const hints = makePrivateBaseRollupHints(seed + 0x100);

  return PrivateBaseRollupInputs.from({
    tubeData,
    hints,
  });
}

function makePublicTubeData(seed = 1) {
  return new PublicTubeData(
    makePrivateToPublicKernelCircuitPublicInputs(seed),
    makeRecursiveProof<typeof TUBE_PROOF_LENGTH>(TUBE_PROOF_LENGTH, seed + 0x100),
    makeVkWitnessData(seed + 0x200),
  );
}

function makeAvmProofData(seed = 1) {
  return new AvmProofData(
    makeAvmCircuitPublicInputs(seed),
    makeRecursiveProof<typeof AVM_PROOF_LENGTH_IN_FIELDS>(AVM_PROOF_LENGTH_IN_FIELDS, seed + 0x100),
    makeVkWitnessData(seed + 0x200),
  );
}

export function makePublicBaseRollupInputs(seed = 0) {
  const tubeData = makePublicTubeData(seed);
  const avmProofData = makeAvmProofData(seed + 0x100);
  const hints = makePublicBaseRollupHints(seed + 0x200);

  return PublicBaseRollupInputs.from({
    tubeData,
    avmProofData,
    hints,
  });
}

export function makeExecutablePrivateFunctionWithMembershipProof(
  seed = 0,
): ExecutablePrivateFunctionWithMembershipProof {
  return {
    selector: makeSelector(seed),
    bytecode: makeBytes(100, seed + 1),
    artifactTreeSiblingPath: makeTuple(3, fr, seed + 2),
    artifactTreeLeafIndex: seed + 2,
    privateFunctionTreeSiblingPath: makeTuple(3, fr, seed + 3),
    privateFunctionTreeLeafIndex: seed + 3,
    artifactMetadataHash: fr(seed + 4),
    functionMetadataHash: fr(seed + 5),
    unconstrainedFunctionsArtifactTreeRoot: fr(seed + 6),
    vkHash: fr(seed + 7),
  };
}

export function makeUnconstrainedFunctionWithMembershipProof(seed = 0): UnconstrainedFunctionWithMembershipProof {
  return {
    selector: makeSelector(seed),
    bytecode: makeBytes(100, seed + 1),
    artifactTreeSiblingPath: makeTuple(3, fr, seed + 2),
    artifactTreeLeafIndex: seed + 2,
    artifactMetadataHash: fr(seed + 4),
    functionMetadataHash: fr(seed + 5),
    privateFunctionsArtifactTreeRoot: fr(seed + 6),
  };
}

export async function makeContractClassPublic(
  seed = 0,
  publicDispatchFunction?: PublicFunction,
): Promise<ContractClassPublic> {
  const artifactHash = fr(seed + 1);
  const publicFunctions = publicDispatchFunction
    ? [publicDispatchFunction]
    : makeTuple(1, makeContractClassPublicFunction, seed + 2);
  const privateFunctionsRoot = fr(seed + 3);
  const packedBytecode = publicDispatchFunction?.bytecode ?? makeBytes(100, seed + 4);
  const publicBytecodeCommitment = await computePublicBytecodeCommitment(packedBytecode);
  const id = await computeContractClassId({ artifactHash, privateFunctionsRoot, publicBytecodeCommitment });
  return {
    id,
    artifactHash,
    packedBytecode,
    privateFunctionsRoot,
    publicFunctions,
    privateFunctions: [],
    unconstrainedFunctions: [],
    version: 1,
  };
}

function makeContractClassPublicFunction(seed = 0): PublicFunction {
  return {
    selector: FunctionSelector.fromField(fr(seed + 1)),
    bytecode: makeBytes(100, seed + 2),
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function makeContractClassPrivateFunction(seed = 0): PrivateFunction {
  return {
    selector: FunctionSelector.fromField(fr(seed + 1)),
    vkHash: fr(seed + 2),
  };
}

export function makeArray<T extends Bufferable>(length: number, fn: (i: number) => T, offset = 0) {
  return Array.from({ length }, (_: any, i: number) => fn(i + offset));
}

export function makeArrayAsync<T extends Bufferable>(length: number, fn: (i: number) => Promise<T>, offset = 0) {
  return Promise.all(
    Array(length)
      .fill(0)
      .map((_: any, i: number) => fn(i + offset)),
  );
}

export function makeVector<T extends Bufferable>(length: number, fn: (i: number) => T, offset = 0) {
  return new Vector(makeArray(length, fn, offset));
}

export async function makeVectorAsync<T extends Bufferable>(length: number, fn: (i: number) => Promise<T>, offset = 0) {
  return new Vector(await makeArrayAsync(length, fn, offset));
}

export function makeMap<T extends Bufferable>(size: number, fn: (i: number) => [string, T], offset = 0) {
  return new Map(makeArray(size, i => fn(i + offset)));
}

export async function makeMapAsync<T extends Bufferable>(
  size: number,
  fn: (i: number) => Promise<[string, T]>,
  offset = 0,
) {
  return new Map(await makeArrayAsync(size, i => fn(i + offset)));
}

export function makePublicKeys(seed = 0): PublicKeys {
  return new PublicKeys(
    new Point(new Fr(seed + 0), new Fr(seed + 1), false),
    new Point(new Fr(seed + 2), new Fr(seed + 3), false),
    new Point(new Fr(seed + 4), new Fr(seed + 5), false),
    new Point(new Fr(seed + 6), new Fr(seed + 7), false),
  );
}

export async function makeContractInstanceFromClassId(
  classId: Fr,
  seed = 0,
  overrides?: {
    deployer?: AztecAddress;
    initializationHash?: Fr;
    publicKeys?: PublicKeys;
    currentClassId?: Fr;
  },
): Promise<ContractInstanceWithAddress> {
  const salt = new Fr(seed);
  const initializationHash = overrides?.initializationHash ?? new Fr(seed + 1);
  const deployer = overrides?.deployer ?? new AztecAddress(new Fr(seed + 2));
  const publicKeys = overrides?.publicKeys ?? makePublicKeys(seed + 3);

  const saltedInitializationHash = await poseidon2HashWithSeparator(
    [salt, initializationHash, deployer],
    GeneratorIndex.PARTIAL_ADDRESS,
  );
  const partialAddress = await poseidon2HashWithSeparator(
    [classId, saltedInitializationHash],
    GeneratorIndex.PARTIAL_ADDRESS,
  );
  const address = await computeAddress(publicKeys, partialAddress);
  return new SerializableContractInstance({
    version: 1,
    salt,
    deployer,
    currentContractClassId: overrides?.currentClassId ?? classId,
    originalContractClassId: classId,
    initializationHash,
    publicKeys,
  }).withAddress(address);
}

export function makeAvmTreeHints(seed = 0): AvmAppendTreeHint {
  return new AvmAppendTreeHint(
    new Fr(seed),
    new Fr(seed + 1),
    makeArray(10, i => new Fr(i), seed + 0x1000),
  );
}

export function makeAvmNullifierReadTreeHints(seed = 0): AvmNullifierReadTreeHint {
  const lowNullifierPreimage = new NullifierLeafPreimage(new Fr(seed), new Fr(seed + 1), BigInt(seed + 2));
  return new AvmNullifierReadTreeHint(
    lowNullifierPreimage,
    new Fr(seed + 1),
    makeArray(10, i => new Fr(i), seed + 0x1000),
  );
}

export function makeAvmPublicDataReadTreeHints(seed = 0): AvmPublicDataReadTreeHint {
  return new AvmPublicDataReadTreeHint(
    new PublicDataTreeLeafPreimage(new Fr(seed), new Fr(seed + 1), new Fr(seed + 2), BigInt(seed + 3)),
    new Fr(seed + 1),
    makeArray(10, i => new Fr(i), seed + 0x1000),
  );
}

export function makeAvmNullifierInsertionTreeHints(seed = 0): AvmNullifierWriteTreeHint {
  return new AvmNullifierWriteTreeHint(
    makeAvmNullifierReadTreeHints(seed),
    makeArray(20, i => new Fr(i), seed + 0x1000),
  );
}

export function makeAvmStorageReadTreeHints(seed = 0): AvmPublicDataReadTreeHint {
  return new AvmPublicDataReadTreeHint(
    new PublicDataTreeLeafPreimage(new Fr(seed), new Fr(seed + 1), new Fr(seed + 2), BigInt(seed + 3)),
    new Fr(seed + 1),
    makeArray(10, i => new Fr(i), seed + 0x1000),
  );
}

export function makeAvmStorageUpdateTreeHints(seed = 0): AvmPublicDataWriteTreeHint {
  return new AvmPublicDataWriteTreeHint(
    makeAvmStorageReadTreeHints(seed),
    new PublicDataTreeLeafPreimage(new Fr(seed), new Fr(seed + 1), new Fr(seed + 2), BigInt(seed + 3)),
    makeArray(20, i => new Fr(i), seed + 0x1000),
  );
}

/**
 * Makes arbitrary AvmContractInstanceHint.
 * @param seed - The seed to use for generating the state reference.
 * @returns AvmContractInstanceHint.
 */
export function makeAvmContractInstanceHint(seed = 0): AvmContractInstanceHint {
  return new AvmContractInstanceHint(
    new AztecAddress(new Fr(seed)),
    true /* exists */,
    new Fr(seed + 0x2),
    new AztecAddress(new Fr(seed + 0x3)),
    new Fr(seed + 0x4),
    new Fr(seed + 0x5),
    new Fr(seed + 0x6),
    new PublicKeys(
      new Point(new Fr(seed + 0x7), new Fr(seed + 0x8), false),
      new Point(new Fr(seed + 0x9), new Fr(seed + 0x10), false),
      new Point(new Fr(seed + 0x11), new Fr(seed + 0x12), false),
      new Point(new Fr(seed + 0x13), new Fr(seed + 0x14), false),
    ),
    makeAvmPublicDataReadTreeHints(seed + 0x2000),
    makeArray(4, i => new Fr(i), seed + 0x3000),
  );
}

/* Makes arbitrary AvmContractClassHint.
 * @param seed - The seed to use for generating the state reference.
 * @returns AvmContractClassHint.
 */
export async function makeAvmContractClassHint(seed = 0): Promise<AvmContractClassHint> {
  const bytecode = makeBytes(32, seed + 0x5);
  return new AvmContractClassHint(
    new Fr(seed),
    true /* exists */,
    new Fr(seed + 0x2),
    new Fr(seed + 0x3),
    await computePublicBytecodeCommitment(bytecode),
    bytecode,
  );
}

export function makeAvmEnqueuedCallHint(seed = 0): AvmEnqueuedCallHint {
  return AvmEnqueuedCallHint.from({
    contractAddress: new AztecAddress(new Fr(seed)),
    calldata: makeVector((seed % 20) + 4, i => new Fr(i), seed + 0x1000),
  });
}

/**
 * Creates arbitrary AvmExecutionHints.
 * @param seed - The seed to use for generating the hints.
 * @returns the execution hints.
 */
export async function makeAvmExecutionHints(
  seed = 0,
  overrides: Partial<FieldsOf<AvmExecutionHints>> = {},
): Promise<AvmExecutionHints> {
  const lengthOffset = 10;
  const lengthSeedMod = 10;
  const baseLength = lengthOffset + (seed % lengthSeedMod);

  return AvmExecutionHints.from({
    enqueuedCalls: makeVector(baseLength, makeAvmEnqueuedCallHint, seed + 0x4100),
    contractInstances: makeVector(baseLength + 5, makeAvmContractInstanceHint, seed + 0x4700),
    contractClasses: await makeVectorAsync(baseLength + 5, makeAvmContractClassHint, seed + 0x4900),
    publicDataReads: makeVector(baseLength + 7, makeAvmStorageReadTreeHints, seed + 0x4900),
    publicDataWrites: makeVector(baseLength + 8, makeAvmStorageUpdateTreeHints, seed + 0x4a00),
    nullifierReads: makeVector(baseLength + 9, makeAvmNullifierReadTreeHints, seed + 0x4b00),
    nullifierWrites: makeVector(baseLength + 10, makeAvmNullifierInsertionTreeHints, seed + 0x4c00),
    noteHashReads: makeVector(baseLength + 11, makeAvmTreeHints, seed + 0x4d00),
    noteHashWrites: makeVector(baseLength + 12, makeAvmTreeHints, seed + 0x4e00),
    l1ToL2MessageReads: makeVector(baseLength + 13, makeAvmTreeHints, seed + 0x4f00),
    ...overrides,
  });
}

/**
 * Creates arbitrary AvmCircuitInputs.
 * @param seed - The seed to use for generating the hints.
 * @returns the execution hints.
 */
export async function makeAvmCircuitInputs(
  seed = 0,
  overrides: Partial<FieldsOf<AvmCircuitInputs>> = {},
): Promise<AvmCircuitInputs> {
  return AvmCircuitInputs.from({
    functionName: `function${seed}`,
    calldata: makeArray((seed % 100) + 10, i => new Fr(i), seed + 0x1000),
    avmHints: await makeAvmExecutionHints(seed + 0x3000),
    publicInputs: makeAvmCircuitPublicInputs(seed + 0x4000),
    ...overrides,
  });
}

/**
 * TODO: Since the max value check is currently disabled this function is pointless. Should it be removed?
 * Test only. Easy to identify big endian field serialize.
 * @param n - The number.
 * @returns The field.
 */
export function fr(n: number): Fr {
  return new Fr(BigInt(n));
}

/** Makes a bloated processed tx for testing purposes. */
export async function makeBloatedProcessedTx({
  seed = 1,
  header,
  db,
  chainId = Fr.ZERO,
  version = Fr.ZERO,
  gasSettings = GasSettings.default({ maxFeesPerGas: new GasFees(10, 10) }),
  vkTreeRoot = Fr.ZERO,
  protocolContractTreeRoot = Fr.ZERO,
  globalVariables = GlobalVariables.empty(),
  feePayer,
  feePaymentPublicDataWrite,
  privateOnly = false,
}: {
  seed?: number;
  header?: BlockHeader;
  db?: MerkleTreeReadOperations;
  chainId?: Fr;
  version?: Fr;
  gasSettings?: GasSettings;
  vkTreeRoot?: Fr;
  globalVariables?: GlobalVariables;
  protocolContractTreeRoot?: Fr;
  feePayer?: AztecAddress;
  feePaymentPublicDataWrite?: PublicDataWrite;
  privateOnly?: boolean;
} = {}) {
  seed *= 0x1000; // Avoid clashing with the previous mock values if seed only increases by 1.
  header ??= db?.getInitialHeader() ?? makeHeader(seed);
  feePayer ??= await AztecAddress.random();

  const txConstantData = TxConstantData.empty();
  txConstantData.historicalHeader = header!;
  txConstantData.txContext.chainId = chainId;
  txConstantData.txContext.version = version;
  txConstantData.txContext.gasSettings = gasSettings;
  txConstantData.vkTreeRoot = vkTreeRoot;
  txConstantData.protocolContractTreeRoot = protocolContractTreeRoot;

  const tx = !privateOnly
    ? await mockTx(seed, { feePayer })
    : await mockTx(seed, {
        numberOfNonRevertiblePublicCallRequests: 0,
        numberOfRevertiblePublicCallRequests: 0,
        feePayer,
      });
  tx.data.constants = txConstantData;

  // No side effects were created in mockTx. The default gasUsed is the tx overhead.
  tx.data.gasUsed = Gas.from({ daGas: FIXED_DA_GAS, l2Gas: FIXED_L2_GAS });

  if (privateOnly) {
    const data = makePrivateToRollupAccumulatedData(seed + 0x1000);

    const transactionFee = tx.data.gasUsed.computeFee(globalVariables.gasFees);
    feePaymentPublicDataWrite ??= new PublicDataWrite(Fr.random(), Fr.random());

    clearLogs(data);

    tx.data.forRollup!.end = data;

    return makeProcessedTxFromPrivateOnlyTx(tx, transactionFee, feePaymentPublicDataWrite, globalVariables);
  } else {
    const nonRevertibleData = tx.data.forPublic!.nonRevertibleAccumulatedData;
    const revertibleData = makePrivateToPublicAccumulatedData(seed + 0x1000);

    revertibleData.nullifiers[MAX_NULLIFIERS_PER_TX - 1] = Fr.ZERO; // Leave one space for the tx hash nullifier in nonRevertibleAccumulatedData.

    clearLogs(revertibleData);

    tx.data.forPublic!.revertibleAccumulatedData = revertibleData;

    const avmOutput = AvmCircuitPublicInputs.empty();
    avmOutput.globalVariables = globalVariables;
    avmOutput.accumulatedData.noteHashes = revertibleData.noteHashes;
    avmOutput.accumulatedData.nullifiers = mergeAccumulatedData(
      nonRevertibleData.nullifiers,
      revertibleData.nullifiers,
      MAX_NULLIFIERS_PER_TX,
    );
    avmOutput.accumulatedData.l2ToL1Msgs = revertibleData.l2ToL1Msgs;
    avmOutput.accumulatedData.publicDataWrites = makeTuple(
      MAX_TOTAL_PUBLIC_DATA_UPDATE_REQUESTS_PER_TX,
      i => new PublicDataWrite(new Fr(i), new Fr(i + 10)),
      seed + 0x2000,
    );

    const avmCircuitInputs = new AvmCircuitInputs('', [], AvmExecutionHints.empty(), avmOutput);

    const gasUsed = {
      totalGas: Gas.empty(),
      teardownGas: Gas.empty(),
      publicGas: Gas.empty(),
      billedGas: Gas.empty(),
    } satisfies GasUsed;

    return makeProcessedTxFromTxWithPublicCalls(
      tx,
      {
        type: ProvingRequestType.PUBLIC_VM,
        inputs: avmCircuitInputs,
      },
      gasUsed,
      RevertCode.OK,
      undefined /* revertReason */,
    );
  }
}

// Remove all logs as it's ugly to mock them at the moment and we are going to change it to have the preimages be part of the public inputs soon.
function clearLogs(data: { publicLogs?: PublicLog[]; contractClassLogsHashes: ScopedLogHash[] }) {
  data.publicLogs?.forEach((_, i) => (data.publicLogs![i] = PublicLog.empty()));
  data.contractClassLogsHashes.forEach((_, i) => (data.contractClassLogsHashes[i] = ScopedLogHash.empty()));
}
