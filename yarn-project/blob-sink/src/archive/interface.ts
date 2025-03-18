import type { BlobJson } from '@aztec/blob-lib';

/** Interface to an blob archiving service. */
export interface BlobArchiveClient {
  getBlobData(id: string): Promise<Buffer | undefined>;
  getBlobsFromBlock(blockId: string): Promise<BlobJson[] | undefined>;
  getBaseUrl(): string;
}
