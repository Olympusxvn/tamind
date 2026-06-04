import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { SealClient, type SealCompatibleClient } from '@mysten/seal';
import { config } from '../config.js';

const clientCache = new Map<string, SuiClient>();
let sealClient: SealClient | null = null;

function cacheKey(tatumApiKey?: string): string {
  const key = tatumApiKey?.trim() || config.tatumApiKey;
  return key || `__public__:${config.suiNetwork}`;
}

function createSuiClient(tatumApiKey?: string): SuiClient {
  const apiKey = tatumApiKey?.trim() || config.tatumApiKey;
  const url = apiKey
    ? config.tatumSuiRpc
    : getFullnodeUrl(config.suiNetwork === 'mainnet' ? 'mainnet' : 'testnet');

  return new SuiClient({
    url,
    ...(apiKey
      ? {
          fetch: (input: RequestInfo | URL, init?: RequestInit) =>
            fetch(input, {
              ...init,
              headers: {
                ...init?.headers,
                'x-api-key': apiKey,
              },
            }),
        }
      : {}),
  });
}

/** Per-request Tatum key when provided; otherwise server env or public fullnode. */
export function getSuiClient(tatumApiKey?: string): SuiClient {
  const key = cacheKey(tatumApiKey);
  let client = clientCache.get(key);
  if (!client) {
    client = createSuiClient(tatumApiKey);
    clientCache.set(key, client);
  }
  return client;
}

export function getSealClient(): SealClient | null {
  if (!config.sealEnabled || !config.sealKeyServerIds.length || !config.packageId) return null;
  if (!sealClient) {
    sealClient = new SealClient({
      suiClient: getSuiClient() as unknown as SealCompatibleClient,
      serverConfigs: config.sealKeyServerIds.map((objectId) => ({ objectId, weight: 1 })),
      verifyKeyServers: false,
    });
  }
  return sealClient;
}

export function hasSeal(): boolean {
  return getSealClient() !== null;
}
