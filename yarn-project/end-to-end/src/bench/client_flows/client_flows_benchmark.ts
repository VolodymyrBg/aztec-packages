import { EcdsaRAccountContractArtifact, getEcdsaRAccount } from '@aztec/accounts/ecdsa';
import { SchnorrAccountContractArtifact, getSchnorrAccount, getSchnorrWallet } from '@aztec/accounts/schnorr';
import {
  type AccountWallet,
  AztecAddress,
  type AztecNode,
  FeeJuicePaymentMethodWithClaim,
  type Logger,
  type PXE,
  createLogger,
} from '@aztec/aztec.js';
import { CheatCodes } from '@aztec/aztec.js/testing';
import { FEE_FUNDING_FOR_TESTER_ACCOUNT } from '@aztec/constants';
import { type DeployL1ContractsArgs, RollupContract, createL1Clients, deployL1Contract } from '@aztec/ethereum';
import { ChainMonitor } from '@aztec/ethereum/test';
import { randomBytes } from '@aztec/foundation/crypto';
import { EthAddress } from '@aztec/foundation/eth-address';
import { Fr } from '@aztec/foundation/fields';
import { TestERC20Abi } from '@aztec/l1-artifacts/TestERC20Abi';
import { TestERC20Bytecode } from '@aztec/l1-artifacts/TestERC20Bytecode';
import { AMMContract } from '@aztec/noir-contracts.js/AMM';
import { FPCContract } from '@aztec/noir-contracts.js/FPC';
import { FeeJuiceContract } from '@aztec/noir-contracts.js/FeeJuice';
import { TokenContract as BananaCoin, TokenContract } from '@aztec/noir-contracts.js/Token';
import { ProtocolContractAddress } from '@aztec/protocol-contracts';
import { getCanonicalFeeJuice } from '@aztec/protocol-contracts/fee-juice';
import { type PXEServiceConfig, createPXEService, getPXEServiceConfig } from '@aztec/pxe/server';
import { deriveSigningKey } from '@aztec/stdlib/keys';

import { MNEMONIC } from '../../fixtures/fixtures.js';
import {
  type ISnapshotManager,
  type SubsystemsContext,
  createSnapshotManager,
  deployAccounts,
} from '../../fixtures/snapshot_manager.js';
import { mintTokensToPrivate } from '../../fixtures/token_utils.js';
import { type SetupOptions, setupCanonicalFeeJuice } from '../../fixtures/utils.js';
import { CrossChainTestHarness } from '../../shared/cross_chain_test_harness.js';
import {
  FeeJuicePortalTestingHarnessFactory,
  type GasBridgingTestHarness,
} from '../../shared/gas_portal_test_harness.js';

const { E2E_DATA_PATH: dataPath } = process.env;

export type AccountType = 'ecdsar1' | 'schnorr';

export class ClientFlowsBenchmark {
  private snapshotManager: ISnapshotManager;

  public logger: Logger;
  public pxe!: PXE;
  public aztecNode!: AztecNode;
  public cheatCodes!: CheatCodes;
  public context!: SubsystemsContext;
  public chainMonitor!: ChainMonitor;
  public feeJuiceBridgeTestHarness!: GasBridgingTestHarness;

  // The admin that aids in the setup of the test
  public adminWallet!: AccountWallet;
  public adminAddress!: AztecAddress;

  // Aztec Node config
  public sequencerAddress!: AztecAddress;
  public coinbase!: EthAddress;

  // Contracts
  public feeJuiceContract!: FeeJuiceContract;
  // Asset in which fees are paid via FPC
  public bananaCoin!: BananaCoin;
  public bananaFPC!: FPCContract;
  // Random asset we want to trade
  public candyBarCoin!: TokenContract;
  // AMM contract
  public amm!: AMMContract;
  // Liquidity token for AMM
  public liquidityToken!: TokenContract;

  // PXE used by the benchmarking user. It can be set up with client-side proving enabled
  public userPXE!: PXE;

  constructor(testName?: string, setupOptions: Partial<SetupOptions & DeployL1ContractsArgs> = {}) {
    this.logger = createLogger(`bench:client_flows${testName ? `:${testName}` : ''}`);
    this.snapshotManager = createSnapshotManager(
      `bench_client_flows${testName ? `/${testName}` : ''}`,
      dataPath,
      { startProverNode: true, ...setupOptions },
      { ...setupOptions },
    );
  }

  async setup() {
    const context = await this.snapshotManager.setup();
    await context.aztecNode.setConfig({ feeRecipient: this.sequencerAddress, coinbase: this.coinbase });

    const rollupContract = RollupContract.getFromConfig(context.aztecNodeConfig);
    this.chainMonitor = new ChainMonitor(rollupContract, this.logger, 200).start();

    return this;
  }

  async teardown() {
    this.chainMonitor.stop();
    await this.snapshotManager.teardown();
  }

  async mintAndBridgeFeeJuice(address: AztecAddress, amount: bigint) {
    const claim = await this.feeJuiceBridgeTestHarness.prepareTokensOnL1(amount, address);
    const { claimSecret: secret, messageLeafIndex: index } = claim;
    await this.feeJuiceContract.methods.claim(address, amount, secret, index).send().wait();
  }

  /** Admin mints bananaCoin tokens privately to the target address and redeems them. */
  async mintPrivateBananas(amount: bigint, address: AztecAddress) {
    const balanceBefore = await this.bananaCoin.methods.balance_of_private(address).simulate();

    await mintTokensToPrivate(this.bananaCoin, this.adminWallet, address, amount);

    const balanceAfter = await this.bananaCoin.methods.balance_of_private(address).simulate();
    expect(balanceAfter).toEqual(balanceBefore + amount);
  }

  async createBenchmarkingAccountManager(type: 'ecdsar1' | 'schnorr') {
    const benchysSecretKey = Fr.random();
    const salt = Fr.random();

    let benchysPrivateSigningKey;
    let benchysAccountManager;
    if (type === 'schnorr') {
      benchysPrivateSigningKey = deriveSigningKey(benchysSecretKey);
      benchysAccountManager = await getSchnorrAccount(this.userPXE, benchysSecretKey, benchysPrivateSigningKey, salt);
    } else if (type === 'ecdsar1') {
      benchysPrivateSigningKey = randomBytes(32);
      benchysAccountManager = await getEcdsaRAccount(this.userPXE, benchysSecretKey, benchysPrivateSigningKey, salt);
    } else {
      throw new Error(`Unknown account type: ${type}`);
    }
    await benchysAccountManager.register();
    return benchysAccountManager;
  }

  public async applyBaseSnapshots() {
    await this.applyInitialAccountsSnapshot();
    await this.applySetupFeeJuiceSnapshot();
  }

  async applyInitialAccountsSnapshot() {
    await this.snapshotManager.snapshot(
      'initial_accounts',
      deployAccounts(2, this.logger),
      async ({ deployedAccounts }, { pxe, aztecNode, aztecNodeConfig }) => {
        this.pxe = pxe;

        this.aztecNode = aztecNode;
        this.cheatCodes = await CheatCodes.create(aztecNodeConfig.l1RpcUrls, pxe);

        const deployedWallets = await Promise.all(
          deployedAccounts.map(a => getSchnorrWallet(pxe, a.address, a.signingKey)),
        );
        [this.adminWallet] = deployedWallets;
        this.adminAddress = this.adminWallet.getAddress();
        this.sequencerAddress = deployedWallets[1].getAddress();

        const canonicalFeeJuice = await getCanonicalFeeJuice();
        this.feeJuiceContract = await FeeJuiceContract.at(canonicalFeeJuice.address, this.adminWallet);
        this.coinbase = EthAddress.random();

        const userPXEConfig = getPXEServiceConfig();
        const l1Contracts = await aztecNode.getL1ContractAddresses();
        const userPXEConfigWithContracts = {
          ...userPXEConfig,
          proverEnabled: ['true', '1'].includes(process.env.REAL_PROOFS ?? ''),
          l1Contracts,
        } as PXEServiceConfig;

        this.userPXE = await createPXEService(this.aztecNode, userPXEConfigWithContracts, 'pxe-user');
      },
    );
  }

  async applySetupFeeJuiceSnapshot() {
    await this.snapshotManager.snapshot(
      'setup_fee_juice',
      async context => {
        await setupCanonicalFeeJuice(context.pxe);
      },
      async (_data, context) => {
        this.context = context;

        this.feeJuiceContract = await FeeJuiceContract.at(ProtocolContractAddress.FeeJuice, this.adminWallet);

        this.feeJuiceBridgeTestHarness = await FeeJuicePortalTestingHarnessFactory.create({
          aztecNode: context.aztecNode,
          aztecNodeAdmin: context.aztecNode,
          pxeService: context.pxe,
          publicClient: context.deployL1ContractsValues.publicClient,
          walletClient: context.deployL1ContractsValues.walletClient,
          wallet: this.adminWallet,
          logger: this.logger,
        });
      },
    );
  }

  async applyDeployBananaTokenSnapshot() {
    await this.snapshotManager.snapshot(
      'deploy_banana_token',
      async () => {
        const bananaCoin = await BananaCoin.deploy(this.adminWallet, this.adminAddress, 'BC', 'BC', 18n)
          .send()
          .deployed();
        this.logger.info(`BananaCoin deployed at ${bananaCoin.address}`);
        return { bananaCoinAddress: bananaCoin.address };
      },
      async ({ bananaCoinAddress }) => {
        this.bananaCoin = await BananaCoin.at(bananaCoinAddress, this.adminWallet);
      },
    );
  }

  async applyDeployCandyBarTokenSnapshot() {
    await this.snapshotManager.snapshot(
      'deploy_candy_bar_token',
      async () => {
        const candyBarCoin = await TokenContract.deploy(this.adminWallet, this.adminAddress, 'CBC', 'CBC', 18n)
          .send()
          .deployed();
        this.logger.info(`CandyBarCoin deployed at ${candyBarCoin.address}`);
        return { candyBarCoinAddress: candyBarCoin.address };
      },
      async ({ candyBarCoinAddress }) => {
        this.candyBarCoin = await TokenContract.at(candyBarCoinAddress, this.adminWallet);
      },
    );
  }

  public async applyFPCSetupSnapshot() {
    await this.snapshotManager.snapshot(
      'fpc_setup',
      async context => {
        const feeJuiceContract = this.feeJuiceBridgeTestHarness.feeJuice;
        expect((await context.pxe.getContractMetadata(feeJuiceContract.address)).isContractPubliclyDeployed).toBe(true);

        const bananaCoin = this.bananaCoin;
        const bananaFPC = await FPCContract.deploy(this.adminWallet, bananaCoin.address, this.adminAddress)
          .send()
          .deployed();

        this.logger.info(`BananaPay deployed at ${bananaFPC.address}`);

        await this.feeJuiceBridgeTestHarness.bridgeFromL1ToL2(FEE_FUNDING_FOR_TESTER_ACCOUNT, bananaFPC.address);

        return { bananaFPCAddress: bananaFPC.address };
      },
      async data => {
        this.bananaFPC = await FPCContract.at(data.bananaFPCAddress, this.adminWallet);
      },
    );
  }

  public async createCrossChainTestHarness(owner: AccountWallet) {
    const { publicClient, walletClient } = createL1Clients(this.context.aztecNodeConfig.l1RpcUrls, MNEMONIC);

    const underlyingERC20Address = await deployL1Contract(walletClient, publicClient, TestERC20Abi, TestERC20Bytecode, [
      'Underlying',
      'UND',
      walletClient.account.address,
    ]).then(({ address }) => address);

    this.logger.verbose(`Setting up cross chain harness...`);
    const crossChainTestHarness = await CrossChainTestHarness.new(
      this.aztecNode,
      this.pxe,
      publicClient,
      walletClient,
      owner,
      this.logger,
      underlyingERC20Address,
    );

    this.logger.verbose(`L2 token deployed to: ${crossChainTestHarness.l2Token.address}`);

    return crossChainTestHarness;
  }

  public async createAndFundBenchmarkingWallet(accountType: AccountType) {
    const benchysAccountManager = await this.createBenchmarkingAccountManager(accountType);
    const benchysWallet = await benchysAccountManager.getWallet();
    const benchysAddress = benchysAccountManager.getAddress();
    const claim = await this.feeJuiceBridgeTestHarness.prepareTokensOnL1(
      FEE_FUNDING_FOR_TESTER_ACCOUNT,
      benchysAddress,
    );
    const paymentMethod = new FeeJuicePaymentMethodWithClaim(benchysWallet, claim);
    await benchysAccountManager.deploy({ fee: { paymentMethod } }).wait();
    // Register benchy on admin's PXE so we can check its balances
    await this.pxe.registerContract({
      instance: benchysAccountManager.getInstance(),
      artifact: accountType === 'ecdsar1' ? EcdsaRAccountContractArtifact : SchnorrAccountContractArtifact,
    });
    await this.pxe.registerAccount(benchysWallet.getSecretKey(), benchysWallet.getCompleteAddress().partialAddress);
    return benchysWallet;
  }

  public async applyDeployAmmSnapshot() {
    await this.snapshotManager.snapshot(
      'deploy_amm',
      async () => {
        const liquidityToken = await TokenContract.deploy(this.adminWallet, this.adminAddress, 'LPT', 'LPT', 18n)
          .send()
          .deployed();
        const amm = await AMMContract.deploy(
          this.adminWallet,
          this.bananaCoin.address,
          this.candyBarCoin.address,
          liquidityToken.address,
        )
          .send()
          .deployed();
        this.logger.info(`AMM deployed at ${amm.address}`);
        await liquidityToken.methods.set_minter(amm.address, true).send().wait();
        return { ammAddress: amm.address, liquidityTokenAddress: liquidityToken.address };
      },
      async ({ ammAddress, liquidityTokenAddress }) => {
        this.liquidityToken = await TokenContract.at(liquidityTokenAddress, this.adminWallet);
        this.amm = await AMMContract.at(ammAddress, this.adminWallet);
      },
    );
  }
}
