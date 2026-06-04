import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { walrusAggregatorUrl } from '@tamind/shared';
import type { WalrusClient } from '@mysten/walrus';
import { config } from '../config.js';

let walrusClient: WalrusClient | null = null;
let walrusSuiClient: SuiClient | null = null;

/** Walrus writeBlob fans out RPC calls — use public fullnode to avoid Tatum 429. */
function getWalrusSuiClient(): SuiClient {
  if (!walrusSuiClient) {
    const network = config.suiNetwork === 'testnet' ? 'testnet' : 'mainnet';
    walrusSuiClient = new SuiClient({
      url: process.env.WALRUS_SUI_RPC ?? getFullnodeUrl(network),
    });
  }
  return walrusSuiClient;
}

function getSigner() {
  if (!config.suiPrivateKey) throw new Error('SUI_PRIVATE_KEY not configured');
  return Ed25519Keypair.fromSecretKey(config.suiPrivateKey);
}

export async function getWalrusClient(): Promise<WalrusClient> {
  if (!walrusClient) {
    const { WalrusClient: Client } = await import('@mysten/walrus');
    walrusClient = new Client({
      network: config.suiNetwork === 'testnet' ? 'testnet' : 'mainnet',
      suiClient: getWalrusSuiClient() as never,
    });
  }
  return walrusClient;
}

export type WalrusUploadResult = {
  blobId: string;
  walrusUrl: string;
};

const UPLOAD_TIMEOUT_MS = 120_000;

async function uploadViaSdk(ciphertext: Uint8Array): Promise<WalrusUploadResult> {
  const network = config.suiNetwork === 'testnet' ? 'testnet' : 'mainnet';
  const signer = getSigner();
  const client = await getWalrusClient();

  const uploadPromise = client.writeBlob({
    blob: ciphertext,
    deletable: false,
    epochs: config.walrusEpochs,
    signer: signer as never,
  });

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Walrus upload timeout (120s)')), UPLOAD_TIMEOUT_MS);
  });

  const { blobId } = await Promise.race([uploadPromise, timeoutPromise]);
  return { blobId, walrusUrl: walrusAggregatorUrl(blobId, network) };
}

async function uploadViaPublisherHttp(ciphertext: Uint8Array): Promise<WalrusUploadResult> {
  const network = config.suiNetwork === 'testnet' ? 'testnet' : 'mainnet';
  const url = `${config.walrusPublisher}/blobs?epochs=${config.walrusEpochs}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: Buffer.from(ciphertext),
  });
  if (!res.ok) {
    throw new Error(`Walrus publisher HTTP ${res.status}: ${await res.text()}`);
  }
  const blobId =
    res.headers.get('X-Walrus-Blob-Id') ??
    res.headers.get('x-walrus-blob-id') ??
    (await res.json().catch(() => ({})) as { blobId?: string }).blobId;
  if (!blobId) throw new Error('Walrus publisher response missing blob ID');
  return { blobId, walrusUrl: walrusAggregatorUrl(blobId, network) };
}

function isRetryableWalrusError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes('429') || msg.includes('timeout') || msg.includes('503');
}

export async function uploadCiphertext(ciphertext: Uint8Array): Promise<WalrusUploadResult> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      return await uploadViaSdk(ciphertext);
    } catch (err) {
      lastError = err;
      if (isRetryableWalrusError(err) && attempt + 1 < 6) {
        await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
        continue;
      }
      break;
    }
  }

  try {
    return await uploadViaPublisherHttp(ciphertext);
  } catch (httpErr) {
    throw lastError ?? httpErr;
  }
}

export async function fetchBlobBytes(walrusUrl: string): Promise<Uint8Array> {
  const res = await fetch(walrusUrl);
  if (!res.ok) throw new Error(`Failed to fetch blob: ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

export async function readBlobById(blobId: string): Promise<Uint8Array> {
  const client = await getWalrusClient();
  return client.readBlob({ blobId });
}
