import { type NamespacedApiHandlers } from '@aztec/foundation/json-rpc/server';
import { type LogFn } from '@aztec/foundation/log';
import {
  type ProverBrokerConfig,
  ProvingJobBrokerSchema,
  createAndStartProvingBroker,
  proverBrokerConfigMappings,
} from '@aztec/prover-client/broker';
import { getProverNodeBrokerConfigFromEnv } from '@aztec/prover-node';
import { type ProvingJobBroker } from '@aztec/stdlib/interfaces/server';
import { getConfigEnvVars as getTelemetryClientConfig, initTelemetryClient } from '@aztec/telemetry-client';

import { extractRelevantOptions } from '../util.js';

export async function startProverBroker(
  options: any,
  signalHandlers: (() => Promise<void>)[],
  services: NamespacedApiHandlers,
  userLog: LogFn,
): Promise<{ broker: ProvingJobBroker; config: ProverBrokerConfig }> {
  if (options.node || options.sequencer || options.pxe || options.p2pBootstrap || options.txe) {
    userLog(`Starting a prover broker with --node, --sequencer, --pxe, --p2p-bootstrap, or --txe is not supported.`);
    process.exit(1);
  }

  const config: ProverBrokerConfig = {
    ...getProverNodeBrokerConfigFromEnv(), // get default config from env
    ...extractRelevantOptions<ProverBrokerConfig>(options, proverBrokerConfigMappings, 'proverBroker'), // override with command line options
  };

  const client = initTelemetryClient(getTelemetryClientConfig());
  const broker = await createAndStartProvingBroker(config, client);
  services.proverBroker = [broker, ProvingJobBrokerSchema];
  signalHandlers.push(() => broker.stop());

  return { broker, config };
}
