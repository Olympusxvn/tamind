export type Dataset = {
  id: number;
  title: string;
  blobId: string;
  sealPolicyId: string;
  priceMist: string;
  seller: string;
  createdAt: number;
  walrusUrl: string;
};

export type PurchaseEvent = {
  datasetId: number;
  buyer: string;
  blobId: string;
  sealPolicyId: string;
  priceMist: string;
};

export type VerifyResult = {
  match: boolean;
  onChainBlobId: string;
  recomputedBlobId: string;
  walrusUrl: string;
  walrusAvailable?: boolean;
  onChainVerified?: boolean;
  demoMode?: boolean;
  bytesLength?: number;
  registryTxDigest?: string;
};

export type PurchaseTxPayload = {
  transactionBlock: string;
  datasetId: number;
  priceMist: string;
};

export type DecryptParams = {
  packageId: string;
  sealPolicyId: string;
  datasetId: number;
  blobId: string;
  walrusUrl: string;
  registryId?: string;
  sealKeyServerIds?: string[];
  sealThreshold?: number;
  sealEnabled?: boolean;
};

export { computeWalrusBlobId, walrusAggregatorUrl } from './walrus/blob-id.js';
