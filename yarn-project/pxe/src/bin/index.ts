#!/usr/bin/env -S node --no-warnings
import { createLogger } from '@aztec/foundation/log';
import { createAztecNodeClient } from '@aztec/stdlib/interfaces/client';

import { getPXEServiceConfig } from '../config/index.js';
import { createPXEService } from '../entrypoints/server/utils.js';
import { startPXEHttpServer } from '../pxe_http/index.js';

const { PXE_PORT = 8080, AZTEC_NODE_URL = 'http://localhost:8079' } = process.env;

const logger = createLogger('pxe:service');

/**
 * Create and start a new PXE HTTP Server
 */
async function main() {
  logger.info(`Setting up PXE...`);

  const pxeConfig = getPXEServiceConfig();
  const nodeRpcClient = createAztecNodeClient(AZTEC_NODE_URL, {});
  const pxeService = await createPXEService(nodeRpcClient, pxeConfig);

  const shutdown = () => {
    logger.info('Shutting down...');
    process.exit(0);
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);

  startPXEHttpServer(pxeService, PXE_PORT);
  logger.info(`PXE listening on port ${PXE_PORT}`);
}

main().catch(err => {
  logger.error(err);
  process.exit(1);
});
