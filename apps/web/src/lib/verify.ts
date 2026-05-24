import type { VerifyResult } from '@tamind/shared';
import { fetchVerifyMeta } from './api';

/** Verify via API: on-chain registry + Walrus availability (demo mode when blob is placeholder). */
export async function verifyDataset(datasetId: number): Promise<VerifyResult> {
  return fetchVerifyMeta(datasetId);
}
