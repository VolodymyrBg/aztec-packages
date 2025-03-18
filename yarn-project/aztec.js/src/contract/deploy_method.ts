import type { Fr } from '@aztec/foundation/fields';
import { type ContractArtifact, type FunctionAbi, type FunctionArtifact, getInitializer } from '@aztec/stdlib/abi';
import { AztecAddress } from '@aztec/stdlib/aztec-address';
import {
  type ContractInstanceWithAddress,
  computePartialAddress,
  getContractClassFromArtifact,
  getContractInstanceFromDeployParams,
} from '@aztec/stdlib/contract';
import type { GasSettings } from '@aztec/stdlib/gas';
import type { PublicKeys } from '@aztec/stdlib/keys';
import type { TxExecutionRequest } from '@aztec/stdlib/tx';

import type { Wallet } from '../account/wallet.js';
import { deployInstance } from '../deployment/deploy_instance.js';
import { registerContractClass } from '../deployment/register_class.js';
import { type ExecutionRequestInit, mergeExecutionRequestInits } from '../entrypoint/entrypoint.js';
import { BaseContractInteraction, type SendMethodOptions } from './base_contract_interaction.js';
import type { Contract } from './contract.js';
import type { ContractBase } from './contract_base.js';
import { ContractFunctionInteraction } from './contract_function_interaction.js';
import { DeployProvenTx } from './deploy_proven_tx.js';
import { DeploySentTx } from './deploy_sent_tx.js';

/**
 * Options for deploying a contract on the Aztec network.
 * Allows specifying a contract address salt, and additional send method options.
 */
// docs:start:deploy_options
export type DeployOptions = {
  /** An optional salt value used to deterministically calculate the contract address. */
  contractAddressSalt?: Fr;
  /** Set to true to *not* include the sender in the address computation. */
  universalDeploy?: boolean;
  /** Skip contract class registration. */
  skipClassRegistration?: boolean;
  /** Skip public deployment, instead just privately initialize the contract. */
  skipPublicDeployment?: boolean;
  /** Skip contract initialization. */
  skipInitialization?: boolean;
} & SendMethodOptions;
// docs:end:deploy_options
// TODO(@spalladino): Add unit tests for this class!

/**
 * Contract interaction for deployment. Handles class registration, public instance deployment,
 * and initialization of the contract. Extends the BaseContractInteraction class.
 */
export class DeployMethod<TContract extends ContractBase = Contract> extends BaseContractInteraction {
  /** The contract instance to be deployed. */
  private instance?: ContractInstanceWithAddress = undefined;

  /** Constructor function to call. */
  private constructorArtifact: FunctionAbi | undefined;

  constructor(
    private publicKeys: PublicKeys,
    wallet: Wallet,
    private artifact: ContractArtifact,
    private postDeployCtor: (address: AztecAddress, wallet: Wallet) => Promise<TContract>,
    private args: any[] = [],
    constructorNameOrArtifact?: string | FunctionArtifact,
  ) {
    super(wallet);
    this.constructorArtifact = getInitializer(artifact, constructorNameOrArtifact);
  }

  /**
   * Create a contract deployment transaction, given the deployment options.
   * This function internally calls `request()` and `sign()` methods to prepare
   * the transaction for deployment. The resulting signed transaction can be
   * later sent using the `send()` method.
   *
   * @param options - An object containing optional deployment settings, contractAddressSalt, and from.
   * @returns A Promise resolving to an object containing the signed transaction data and other relevant information.
   */
  public async create(options: DeployOptions = {}): Promise<TxExecutionRequest> {
    const requestWithoutFee = await this.request(options);
    const fee = await this.getFeeOptions({ ...requestWithoutFee, fee: options.fee });
    return this.wallet.createTxExecutionRequest({ ...requestWithoutFee, fee });
  }

  // REFACTOR: Having a `request` method with different semantics than the ones in the other
  // derived ContractInteractions is confusing. We should unify the flow of all ContractInteractions.

  /**
   * Returns an array of function calls that represent this operation. Useful as a building
   * block for constructing batch requests.
   * @param options - Deployment options.
   * @returns An array of function calls.
   * @remarks This method does not have the same return type as the `request` in the ContractInteraction object,
   * it returns a promise for an array instead of a function call directly.
   */
  public async request(options: DeployOptions = {}): Promise<Omit<ExecutionRequestInit, 'fee'>> {
    const deployment = await this.getDeploymentFunctionCalls(options);

    // TODO: Should we add the contracts to the DB here, or once the tx has been sent or mined?
    // Note that we need to run this registerContract here so it's available when computeFeeOptionsFromEstimatedGas
    // runs, since it needs the contract to have been registered in order to estimate gas for its initialization,
    // in case the initializer is public. This hints at the need of having "transient" contracts scoped to a
    // simulation, so we can run the simulation with a set of contracts, but only "commit" them to the wallet
    // once this tx has gone through.
    await this.wallet.registerContract({ artifact: this.artifact, instance: await this.getInstance(options) });

    const bootstrap = await this.getInitializeFunctionCalls(options);

    const requests = await Promise.all([...deployment, ...bootstrap].map(c => c.request()));
    if (!requests.length) {
      throw new Error(`No function calls needed to deploy contract ${this.artifact.name}`);
    }

    const { nonce, cancellable } = options;
    return mergeExecutionRequestInits(requests, { nonce, cancellable });
  }

  /**
   * Register this contract in the PXE and returns the Contract object.
   * @param options - Deployment options.
   */
  public async register(options: DeployOptions = {}): Promise<TContract> {
    const instance = await this.getInstance(options);
    await this.wallet.registerContract({ artifact: this.artifact, instance });
    return this.postDeployCtor(instance.address, this.wallet);
  }

  /**
   * Returns calls for registration of the class and deployment of the instance, depending on the provided options.
   * @param options - Deployment options.
   * @returns A function call array with potentially requests to the class registerer and instance deployer.
   */
  protected async getDeploymentFunctionCalls(options: DeployOptions = {}): Promise<ContractFunctionInteraction[]> {
    const calls: ContractFunctionInteraction[] = [];

    // Set contract instance object so it's available for populating the DeploySendTx object
    const instance = await this.getInstance(options);

    // Obtain contract class from artifact and check it matches the reported one by the instance.
    // TODO(@spalladino): We're unnecessarily calculating the contract class multiple times here.
    const contractClass = await getContractClassFromArtifact(this.artifact);
    if (!instance.currentContractClassId.equals(contractClass.id)) {
      throw new Error(
        `Contract class mismatch when deploying contract: got ${instance.currentContractClassId.toString()} from instance and ${contractClass.id.toString()} from artifact`,
      );
    }

    // Register the contract class if it hasn't been published already.
    if (!options.skipClassRegistration) {
      if ((await this.wallet.getContractClassMetadata(contractClass.id)).isContractClassPubliclyRegistered) {
        this.log.debug(
          `Skipping registration of already registered contract class ${contractClass.id.toString()} for ${instance.address.toString()}`,
        );
      } else {
        this.log.info(
          `Creating request for registering contract class ${contractClass.id.toString()} as part of deployment for ${instance.address.toString()}`,
        );
        const registerContractClassInteraction = await registerContractClass(this.wallet, this.artifact);
        calls.push(registerContractClassInteraction);
      }
    }

    // Deploy the contract via the instance deployer.
    if (!options.skipPublicDeployment) {
      const deploymentInteraction = await deployInstance(this.wallet, instance);
      calls.push(deploymentInteraction);
    }

    return calls;
  }

  /**
   * Returns the calls necessary to initialize the contract.
   * @param options - Deployment options.
   * @returns - An array of function calls.
   */
  protected async getInitializeFunctionCalls(options: DeployOptions): Promise<ContractFunctionInteraction[]> {
    const calls: ContractFunctionInteraction[] = [];
    if (this.constructorArtifact && !options.skipInitialization) {
      const { address } = await this.getInstance(options);
      const constructorCall = new ContractFunctionInteraction(
        this.wallet,
        address,
        this.constructorArtifact,
        this.args,
      );
      calls.push(constructorCall);
    }
    return calls;
  }

  /**
   * Send the contract deployment transaction using the provided options.
   * This function extends the 'send' method from the ContractFunctionInteraction class,
   * allowing us to send a transaction specifically for contract deployment.
   *
   * @param options - An object containing various deployment options such as contractAddressSalt and from.
   * @returns A SentTx object that returns the receipt and the deployed contract instance.
   */
  public override send(options: DeployOptions = {}): DeploySentTx<TContract> {
    const txHashPromise = super.send(options).getTxHash();
    this.log.debug(`Sent deployment tx of ${this.artifact.name} contract`);
    return new DeploySentTx(this.wallet, txHashPromise, this.postDeployCtor, () => this.getInstance(options));
  }

  /**
   * Builds the contract instance to be deployed and returns it.
   *
   * @param options - An object containing various deployment options.
   * @returns An instance object.
   */
  public async getInstance(options: DeployOptions = {}): Promise<ContractInstanceWithAddress> {
    if (!this.instance) {
      this.instance = await getContractInstanceFromDeployParams(this.artifact, {
        constructorArgs: this.args,
        salt: options.contractAddressSalt,
        publicKeys: this.publicKeys,
        constructorArtifact: this.constructorArtifact,
        deployer: options.universalDeploy ? AztecAddress.ZERO : this.wallet.getAddress(),
      });
    }
    return this.instance;
  }

  /**
   * Prove the request.
   * @param options - Deployment options.
   * @returns The proven tx.
   */
  public override async prove(options: DeployOptions): Promise<DeployProvenTx<TContract>> {
    const txProvingResult = await this.proveInternal(options);
    return new DeployProvenTx(this.wallet, txProvingResult.toTx(), this.postDeployCtor, () =>
      this.getInstance(options),
    );
  }

  /**
   * Estimates gas cost for this deployment operation.
   * @param options - Options.
   */
  public override estimateGas(
    options?: Omit<DeployOptions, 'estimateGas' | 'skipPublicSimulation'>,
  ): Promise<Pick<GasSettings, 'gasLimits' | 'teardownGasLimits'>> {
    return super.estimateGas(options);
  }

  /** Return this deployment address. */
  public get address() {
    return this.instance?.address;
  }

  /** Returns the partial address for this deployment. */
  public get partialAddress() {
    return this.instance && computePartialAddress(this.instance);
  }
}
