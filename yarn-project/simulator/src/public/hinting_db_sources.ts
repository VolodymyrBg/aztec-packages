import { Fr } from '@aztec/foundation/fields';
import { type Logger, createLogger } from '@aztec/foundation/log';
import type { IndexedTreeLeafPreimage, SiblingPath } from '@aztec/foundation/trees';
import type { FunctionSelector } from '@aztec/stdlib/abi';
import {
  AvmBytecodeCommitmentHint,
  AvmContractClassHint,
  AvmContractInstanceHint,
  type AvmExecutionHints,
  AvmGetLeafPreimageHintPublicDataTree,
  AvmGetPreviousValueIndexHint,
  AvmGetSiblingPathHint,
} from '@aztec/stdlib/avm';
import type { AztecAddress } from '@aztec/stdlib/aztec-address';
import type { ContractClassPublic, ContractInstanceWithAddress } from '@aztec/stdlib/contract';
import {
  AppendOnlyTreeSnapshot,
  type IndexedTreeId,
  MerkleTreeId,
  PublicDataTreeLeaf,
  type SequentialInsertionResult,
  getTreeName,
} from '@aztec/stdlib/trees';

import type { PublicContractsDBInterface } from '../common/db_interfaces.js';
import { PublicTreesDB } from './public_db_sources.js';

/**
 * A public contracts database that forwards requests and collects AVM hints.
 */
export class HintingPublicContractsDB implements PublicContractsDBInterface {
  constructor(private readonly db: PublicContractsDBInterface, private hints: AvmExecutionHints) {}

  public async getContractInstance(
    address: AztecAddress,
    blockNumber: number,
  ): Promise<ContractInstanceWithAddress | undefined> {
    const instance = await this.db.getContractInstance(address, blockNumber);
    if (instance) {
      // We don't need to hint the block number because it doesn't change.
      this.hints.contractInstances.push(
        new AvmContractInstanceHint(
          instance.address,
          instance.salt,
          instance.deployer,
          instance.currentContractClassId,
          instance.originalContractClassId,
          instance.initializationHash,
          instance.publicKeys,
        ),
      );
    }
    return instance;
  }

  public async getContractClass(contractClassId: Fr): Promise<ContractClassPublic | undefined> {
    const contractClass = await this.db.getContractClass(contractClassId);
    if (contractClass) {
      this.hints.contractClasses.push(
        new AvmContractClassHint(
          contractClass.id,
          contractClass.artifactHash,
          contractClass.privateFunctionsRoot,
          contractClass.packedBytecode,
        ),
      );
    }
    return contractClass;
  }

  public async getBytecodeCommitment(contractClassId: Fr): Promise<Fr | undefined> {
    const commitment = await this.db.getBytecodeCommitment(contractClassId);
    if (commitment) {
      this.hints.bytecodeCommitments.push(new AvmBytecodeCommitmentHint(contractClassId, commitment));
    }
    return commitment;
  }

  public async getDebugFunctionName(
    contractAddress: AztecAddress,
    selector: FunctionSelector,
  ): Promise<string | undefined> {
    return await this.db.getDebugFunctionName(contractAddress, selector);
  }
}

/**
 * A public trees database that forwards requests and collects AVM hints.
 */
export class HintingPublicTreesDB extends PublicTreesDB {
  private static readonly log: Logger = createLogger('HintingPublicTreesDB');

  constructor(db: PublicTreesDB, private hints: AvmExecutionHints) {
    super(db);
  }

  // Getters.
  public override async getSiblingPath<N extends number>(treeId: MerkleTreeId, index: bigint): Promise<SiblingPath<N>> {
    const path = await super.getSiblingPath<N>(treeId, index);
    const key = await this.getHintKey(treeId);
    this.hints.getSiblingPathHints.push(new AvmGetSiblingPathHint(key, treeId, index, path.toFields()));
    return Promise.resolve(path);
  }

  public override async getPreviousValueIndex<ID extends IndexedTreeId>(
    treeId: ID,
    value: bigint,
  ): Promise<
    | {
        index: bigint;
        alreadyPresent: boolean;
      }
    | undefined
  > {
    const result = await super.getPreviousValueIndex(treeId, value);
    if (result === undefined) {
      throw new Error(
        `getPreviousValueIndex(${getTreeName(
          treeId,
        )}, ${value}}) returned undefined. Possible wrong tree setup or corrupted state.`,
      );
    }
    const key = await this.getHintKey(treeId);
    this.hints.getPreviousValueIndexHints.push(
      new AvmGetPreviousValueIndexHint(key, treeId, new Fr(value), result.index, result.alreadyPresent),
    );
    return result;
  }

  public override async getLeafPreimage<ID extends IndexedTreeId>(
    treeId: ID,
    index: bigint,
  ): Promise<IndexedTreeLeafPreimage | undefined> {
    const preimage = await super.getLeafPreimage<ID>(treeId, index);
    if (preimage) {
      const key = await this.getHintKey(treeId);

      switch (treeId) {
        case MerkleTreeId.PUBLIC_DATA_TREE:
          this.hints.getLeafPreimageHintsPublicDataTree.push(
            new AvmGetLeafPreimageHintPublicDataTree(
              key,
              index,
              preimage.asLeaf() as PublicDataTreeLeaf,
              preimage.getNextIndex(),
              new Fr(preimage.getNextKey()),
            ),
          );
          break;
        default:
          HintingPublicTreesDB.log.debug(`getLeafPreimage not hinted for tree ${getTreeName(treeId)} yet!`);
          break;
      }
    }

    return preimage;
  }

  // State modification.
  public override async sequentialInsert<TreeHeight extends number, ID extends IndexedTreeId>(
    treeId: ID,
    leaves: Buffer[],
  ): Promise<SequentialInsertionResult<TreeHeight>> {
    HintingPublicTreesDB.log.debug('sequentialInsert not hinted yet!');
    const beforeState = await this.getHintKey(treeId);

    const result = await super.sequentialInsert<TreeHeight, ID>(treeId, leaves);

    const afterState = await this.getHintKey(treeId);
    HintingPublicTreesDB.log.debug(
      `Evolved tree state (${getTreeName(treeId)}): ${beforeState.root}, ${beforeState.nextAvailableLeafIndex} -> ${
        afterState.root
      }, ${afterState.nextAvailableLeafIndex}.`,
    );

    return result;
  }

  public override async revertCheckpoint(): Promise<void> {
    HintingPublicTreesDB.log.debug('revertCheckpoint not hinted yet!');
    // TODO(fcarreiro): we probably want to hint on StateReference hash.
    // WARNING: is this enough? we might actually need the number of the checkpoint or similar...
    // We will need to keep a stack of checkpoints on the C++ side.
    const beforeState = {
      [MerkleTreeId.PUBLIC_DATA_TREE]: await this.getHintKey(MerkleTreeId.PUBLIC_DATA_TREE),
      [MerkleTreeId.NULLIFIER_TREE]: await this.getHintKey(MerkleTreeId.NULLIFIER_TREE),
      [MerkleTreeId.NOTE_HASH_TREE]: await this.getHintKey(MerkleTreeId.NOTE_HASH_TREE),
      [MerkleTreeId.L1_TO_L2_MESSAGE_TREE]: await this.getHintKey(MerkleTreeId.L1_TO_L2_MESSAGE_TREE),
      [MerkleTreeId.ARCHIVE]: await this.getHintKey(MerkleTreeId.ARCHIVE),
    };

    await super.revertCheckpoint();

    const afterState = {
      [MerkleTreeId.PUBLIC_DATA_TREE]: await this.getHintKey(MerkleTreeId.PUBLIC_DATA_TREE),
      [MerkleTreeId.NULLIFIER_TREE]: await this.getHintKey(MerkleTreeId.NULLIFIER_TREE),
      [MerkleTreeId.NOTE_HASH_TREE]: await this.getHintKey(MerkleTreeId.NOTE_HASH_TREE),
      [MerkleTreeId.L1_TO_L2_MESSAGE_TREE]: await this.getHintKey(MerkleTreeId.L1_TO_L2_MESSAGE_TREE),
      [MerkleTreeId.ARCHIVE]: await this.getHintKey(MerkleTreeId.ARCHIVE),
    };

    HintingPublicTreesDB.log.debug('Evolved tree state:');
    for (const treeId of Object.keys(beforeState)) {
      const id: MerkleTreeId = treeId as unknown as MerkleTreeId;
      const treeName = getTreeName(id);
      HintingPublicTreesDB.log.debug(
        `${treeName}: ${beforeState[id].root}, ${beforeState[id].nextAvailableLeafIndex} -> ${afterState[id].root}, ${afterState[id].nextAvailableLeafIndex}.`,
      );
    }
  }

  // Private methods.
  private async getHintKey(treeId: MerkleTreeId): Promise<AppendOnlyTreeSnapshot> {
    const treeInfo = await super.getTreeInfo(treeId);
    return new AppendOnlyTreeSnapshot(Fr.fromBuffer(treeInfo.root), Number(treeInfo.size));
  }
}
