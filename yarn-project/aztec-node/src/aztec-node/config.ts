import { type ArchiverConfig, archiverConfigMappings } from '@aztec/archiver/config';
import { type L1ContractAddresses, l1ContractAddressesMapping } from '@aztec/ethereum';
import { type ConfigMappingsType, booleanConfigHelper, getConfigFromMappings } from '@aztec/foundation/config';
import { type DataStoreConfig, dataConfigMappings } from '@aztec/kv-store/config';
import { type SharedNodeConfig, sharedNodeConfigMappings } from '@aztec/node-lib/config';
import { type P2PConfig, p2pConfigMappings } from '@aztec/p2p/config';
import { type ProverClientConfig, proverClientConfigMappings } from '@aztec/prover-client/config';
import { type SequencerClientConfig, sequencerClientConfigMappings } from '@aztec/sequencer-client/config';
import { type ValidatorClientConfig, validatorClientConfigMappings } from '@aztec/validator-client/config';
import { type WorldStateConfig, worldStateConfigMappings } from '@aztec/world-state/config';

import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import { type SentinelConfig, sentinelConfigMappings } from '../sentinel/config.js';

export { sequencerClientConfigMappings, type SequencerClientConfig };

/**
 * The configuration the aztec node.
 */
export type AztecNodeConfig = ArchiverConfig &
  SequencerClientConfig &
  ValidatorClientConfig &
  ProverClientConfig &
  WorldStateConfig &
  Pick<ProverClientConfig, 'bbBinaryPath' | 'bbWorkingDirectory' | 'realProofs'> &
  P2PConfig &
  DataStoreConfig &
  SentinelConfig &
  SharedNodeConfig & {
    /** L1 contracts addresses */
    l1Contracts: L1ContractAddresses;
    /** Whether the validator is disabled for this node */
    disableValidator: boolean;
  };

export const aztecNodeConfigMappings: ConfigMappingsType<AztecNodeConfig> = {
  ...dataConfigMappings,
  ...archiverConfigMappings,
  ...sequencerClientConfigMappings,
  ...validatorClientConfigMappings,
  ...proverClientConfigMappings,
  ...worldStateConfigMappings,
  ...p2pConfigMappings,
  ...sentinelConfigMappings,
  ...sharedNodeConfigMappings,
  l1Contracts: {
    description: 'The deployed L1 contract addresses',
    nested: l1ContractAddressesMapping,
  },
  disableValidator: {
    env: 'VALIDATOR_DISABLED',
    description: 'Whether the validator is disabled for this node.',
    ...booleanConfigHelper(),
  },
};

/**
 * Returns the config of the aztec node from environment variables with reasonable defaults.
 * @returns A valid aztec node config.
 */
export function getConfigEnvVars(): AztecNodeConfig {
  return getConfigFromMappings<AztecNodeConfig>(aztecNodeConfigMappings);
}

/**
 * Returns package version.
 */
export function getPackageVersion() {
  const releasePleaseManifestPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../.release-please-manifest.json',
  );
  const version = JSON.parse(readFileSync(releasePleaseManifestPath).toString());
  return version['.'];
}
