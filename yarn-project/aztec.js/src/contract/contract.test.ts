import {
  type Tx,
  type TxExecutionRequest,
  type TxHash,
  type TxProvingResult,
  type TxReceipt,
  type TxSimulationResult,
} from '@aztec/circuit-types';
import {
  AztecAddress,
  CompleteAddress,
  type ContractInstanceWithAddress,
  EthAddress,
  GasFees,
  type NodeInfo,
  getContractClassFromArtifact,
} from '@aztec/circuits.js';
import { type L1ContractAddresses } from '@aztec/ethereum/l1-contract-addresses';
import { type AbiDecoded, type ContractArtifact, FunctionType } from '@aztec/foundation/abi';

import { type MockProxy, mock } from 'jest-mock-extended';

import { type Wallet } from '../account/wallet.js';
import { Contract } from './contract.js';

describe('Contract Class', () => {
  let wallet: MockProxy<Wallet>;
  let contractAddress: AztecAddress;
  let account: CompleteAddress;
  let contractInstance: ContractInstanceWithAddress;

  const mockTx = { type: 'Tx' } as any as Tx;
  const mockTxProvingResult = { type: 'TxProvingResult', toTx: () => mockTx } as any as TxProvingResult;
  const mockTxRequest = { type: 'TxRequest' } as any as TxExecutionRequest;
  const mockTxHash = { type: 'TxHash' } as any as TxHash;
  const mockTxReceipt = { type: 'TxReceipt' } as any as TxReceipt;
  const mockTxSimulationResult = { type: 'TxSimulationResult' } as any as TxSimulationResult;
  const mockUnconstrainedResultValue = 1;
  const l1Addresses: L1ContractAddresses = {
    rollupAddress: EthAddress.random(),
    registryAddress: EthAddress.random(),
    inboxAddress: EthAddress.random(),
    outboxAddress: EthAddress.random(),
    feeJuiceAddress: EthAddress.random(),
    stakingAssetAddress: EthAddress.random(),
    feeJuicePortalAddress: EthAddress.random(),
    governanceAddress: EthAddress.random(),
    coinIssuerAddress: EthAddress.random(),
    rewardDistributorAddress: EthAddress.random(),
    governanceProposerAddress: EthAddress.random(),
    slashFactoryAddress: EthAddress.random(),
  };

  const defaultArtifact: ContractArtifact = {
    name: 'FooContract',
    functions: [
      {
        name: 'bar',
        isInitializer: false,
        functionType: FunctionType.PRIVATE,
        isInternal: false,
        isStatic: false,
        debugSymbols: '',
        parameters: [
          {
            name: 'value',
            type: {
              kind: 'field',
            },
            visibility: 'public',
          },
          {
            name: 'value',
            type: {
              kind: 'field',
            },
            visibility: 'private',
          },
        ],
        returnTypes: [],
        errorTypes: {},
        bytecode: Buffer.alloc(8, 0xfa),
        verificationKey: 'fake-verification-key',
      },
      {
        name: 'public_dispatch',
        isInitializer: false,
        isStatic: false,
        functionType: FunctionType.PUBLIC,
        isInternal: false,
        parameters: [
          {
            name: 'selector',
            type: {
              kind: 'field',
            },
            visibility: 'public',
          },
        ],
        returnTypes: [],
        errorTypes: {},
        bytecode: Buffer.alloc(8, 0xfb),
        debugSymbols: '',
      },
      {
        name: 'qux',
        isInitializer: false,
        isStatic: false,
        functionType: FunctionType.UNCONSTRAINED,
        isInternal: false,
        parameters: [
          {
            name: 'value',
            type: {
              kind: 'field',
            },
            visibility: 'public',
          },
        ],
        returnTypes: [
          {
            kind: 'integer',
            sign: 'unsigned',
            width: 32,
          },
        ],
        bytecode: Buffer.alloc(8, 0xfc),
        debugSymbols: '',
        errorTypes: {},
      },
    ],
    outputs: {
      structs: {},
      globals: {},
    },
    fileMap: {},
    storageLayout: {},
    notes: {},
  };

  beforeEach(async () => {
    contractAddress = await AztecAddress.random();
    account = await CompleteAddress.random();
    const contractClass = await getContractClassFromArtifact(defaultArtifact);
    contractInstance = {
      address: contractAddress,
      currentContractClassId: contractClass.id,
      originalContractClassId: contractClass.id,
    } as ContractInstanceWithAddress;

    const mockNodeInfo: NodeInfo = {
      nodeVersion: 'vx.x.x',
      l1ChainId: 1,
      protocolVersion: 2,
      l1ContractAddresses: l1Addresses,
      enr: undefined,
      protocolContractAddresses: {
        classRegisterer: await AztecAddress.random(),
        feeJuice: await AztecAddress.random(),
        instanceDeployer: await AztecAddress.random(),
        multiCallEntrypoint: await AztecAddress.random(),
      },
    };

    wallet = mock<Wallet>();
    wallet.simulateTx.mockResolvedValue(mockTxSimulationResult);
    wallet.createTxExecutionRequest.mockResolvedValue(mockTxRequest);
    wallet.getContractMetadata.mockResolvedValue({
      contractInstance,
      isContractInitialized: true,
      isContractPubliclyDeployed: true,
    });
    wallet.sendTx.mockResolvedValue(mockTxHash);
    wallet.simulateUnconstrained.mockResolvedValue(mockUnconstrainedResultValue as any as AbiDecoded);
    wallet.getTxReceipt.mockResolvedValue(mockTxReceipt);
    wallet.getNodeInfo.mockResolvedValue(mockNodeInfo);
    wallet.proveTx.mockResolvedValue(mockTxProvingResult);
    wallet.getRegisteredAccounts.mockResolvedValue([account]);
    wallet.getCurrentBaseFees.mockResolvedValue(new GasFees(100, 100));
  });

  it('should create and send a contract method tx', async () => {
    const fooContract = await Contract.at(contractAddress, defaultArtifact, wallet);
    const param0 = 12;
    const param1 = 345n;
    const sentTx = fooContract.methods.bar(param0, param1).send();
    const txHash = await sentTx.getTxHash();
    const receipt = await sentTx.getReceipt();

    expect(txHash).toBe(mockTxHash);
    expect(receipt).toBe(mockTxReceipt);
    expect(wallet.createTxExecutionRequest).toHaveBeenCalledTimes(1);
    expect(wallet.sendTx).toHaveBeenCalledTimes(1);
    expect(wallet.sendTx).toHaveBeenCalledWith(mockTx);
  });

  it('should call view on an unconstrained function', async () => {
    const fooContract = await Contract.at(contractAddress, defaultArtifact, wallet);
    const result = await fooContract.methods.qux(123n).simulate({
      from: account.address,
    });
    expect(wallet.simulateUnconstrained).toHaveBeenCalledTimes(1);
    expect(wallet.simulateUnconstrained).toHaveBeenCalledWith('qux', [123n], contractAddress, account.address);
    expect(result).toBe(mockUnconstrainedResultValue);
  });

  it('should not call create on an unconstrained function', async () => {
    const fooContract = await Contract.at(contractAddress, defaultArtifact, wallet);
    await expect(fooContract.methods.qux().create()).rejects.toThrow();
  });
});
