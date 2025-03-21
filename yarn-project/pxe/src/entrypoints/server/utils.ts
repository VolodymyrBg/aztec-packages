import { BBNativePrivateKernelProver } from '@aztec/bb-prover';
import { BBWASMBundlePrivateKernelProver } from '@aztec/bb-prover/wasm/bundle';
import { randomBytes } from '@aztec/foundation/crypto';
import { createLogger } from '@aztec/foundation/log';
import { createStore } from '@aztec/kv-store/lmdb-v2';
import { BundledProtocolContractsProvider } from '@aztec/protocol-contracts/providers/bundle';
import { type SimulationProvider, WASMSimulator } from '@aztec/simulator/client';
import type { AztecNode } from '@aztec/stdlib/interfaces/client';

import type { PXEServiceConfig } from '../../config/index.js';
import { PXEService } from '../../pxe_service/pxe_service.js';
import { PXE_DATA_SCHEMA_VERSION } from '../../storage/index.js';

/**
 * Create and start an PXEService instance with the given AztecNode and config.
 *
 * @param aztecNode - The AztecNode instance to be used by the server.
 * @param config - The PXE Service Config to use
 * @param useLogSuffix - Whether to add a randomly generated suffix to the PXE debug logs.
 * @returns A Promise that resolves to the started PXEService instance.
 */
export function createPXEService(
  aztecNode: AztecNode,
  config: PXEServiceConfig,
  useLogSuffix: string | boolean | undefined = undefined,
) {
  const simulationProvider = new WASMSimulator();
  return createPXEServiceWithSimulationProvider(aztecNode, simulationProvider, config, useLogSuffix);
}

/**
 * Create and start an PXEService instance with the given AztecNode, SimulationProvider and config.
 *
 * @param aztecNode - The AztecNode instance to be used by the server.
 * @param simulationProvider - The SimulationProvider to use
 * @param config - The PXE Service Config to use
 * @param useLogSuffix - Whether to add a randomly generated suffix to the PXE debug logs.
 * @returns A Promise that resolves to the started PXEService instance.
 */
export async function createPXEServiceWithSimulationProvider(
  aztecNode: AztecNode,
  simulationProvider: SimulationProvider,
  config: PXEServiceConfig,
  useLogSuffix: string | boolean | undefined = undefined,
) {
  const logSuffix =
    typeof useLogSuffix === 'boolean' ? (useLogSuffix ? randomBytes(3).toString('hex') : undefined) : useLogSuffix;

  const l1Contracts = await aztecNode.getL1ContractAddresses();
  const configWithContracts = {
    ...config,
    l1Contracts,
  } as PXEServiceConfig;

  const store = await createStore(
    'pxe_data',
    PXE_DATA_SCHEMA_VERSION,
    configWithContracts,
    createLogger('pxe:data:lmdb'),
  );

  const prover = await createProver(config, simulationProvider, logSuffix);
  const protocolContractsProvider = new BundledProtocolContractsProvider();
  const pxe = await PXEService.create(
    aztecNode,
    store,
    prover,
    simulationProvider,
    protocolContractsProvider,
    config,
    logSuffix,
  );
  return pxe;
}

function createProver(config: PXEServiceConfig, simulationProvider: SimulationProvider, logSuffix?: string) {
  if (!config.bbBinaryPath || !config.bbWorkingDirectory) {
    return new BBWASMBundlePrivateKernelProver(simulationProvider, 16);
  } else {
    const bbConfig = config as Required<Pick<PXEServiceConfig, 'bbBinaryPath' | 'bbWorkingDirectory'>> &
      PXEServiceConfig;
    const log = createLogger('pxe:bb-native-prover' + (logSuffix ? `:${logSuffix}` : ''));
    return BBNativePrivateKernelProver.new({ bbSkipCleanup: false, ...bbConfig }, simulationProvider, log);
  }
}
