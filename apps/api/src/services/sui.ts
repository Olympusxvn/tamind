import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { SealClient, type SealCompatibleClient } from '@mysten/seal';
import { config } from '../config.js';

let suiClient: SuiClient | null = null;
let sealClient: SealClient | null = null;

export function getSuiClient(): SuiClient {
  if (!suiClient) {
    const url = config.tatumApiKey
      ? config.tatumSuiRpc
      : getFullnodeUrl(config.suiNetwork === 'mainnet' ? 'mainnet' : 'testnet');

    suiClient = new SuiClient({
      url,
      ...(config.tatumApiKey
        ? {
            fetch: (input: RequestInfo | URL, init?: RequestInit) =>
              fetch(input, {
                ...init,
                headers: {
                  ...init?.headers,
                  'x-api-key': config.tatumApiKey,
                },
              }),
          }
        : {}),
    });
  }
  return suiClient;
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
