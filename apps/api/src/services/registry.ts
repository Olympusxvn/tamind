import type { Dataset } from '@tamind/shared';
import { walrusAggregatorUrl } from '@tamind/shared';
import { getSuiClient } from './sui.js';
import { config } from '../config.js';

function decodeBytes(value: unknown): Uint8Array {
  if (Array.isArray(value)) return Uint8Array.from(value as number[]);
  if (typeof value !== 'string') return new Uint8Array();

  // Sui JSON often returns base64 for vector<u8>
  try {
    const decoded = Buffer.from(value, 'base64').toString('utf8');
    const vectorMatch = decoded.match(/^vector\[(.*)\]$/);
    if (vectorMatch) {
      const nums = vectorMatch[1].split(',').map((n) => parseInt(n.trim(), 10));
      return Uint8Array.from(nums.filter((n) => !Number.isNaN(n)));
    }
    if (decoded.length > 0 && decoded !== value) {
      return Uint8Array.from(Buffer.from(decoded, 'utf8'));
    }
  } catch {
    /* fall through */
  }

  if (value.startsWith('0x')) return Uint8Array.from(Buffer.from(value.slice(2), 'hex'));
  return Uint8Array.from(Buffer.from(value, 'utf8'));
}

function bytesToHex(value: unknown): string {
  return Buffer.from(decodeBytes(value)).toString('hex');
}

function bytesToString(value: unknown): string {
  return Buffer.from(decodeBytes(value)).toString('utf8');
}

function unwrapDataset(raw: Record<string, unknown>): Record<string, unknown> {
  const inner = raw.fields as Record<string, unknown> | undefined;
  return inner && typeof inner === 'object' ? inner : raw;
}

function chainText(value: unknown): string {
  const text = bytesToString(value);
  if (text.length > 0) return text;
  return bytesToHex(value);
}

function parseDataset(raw: Record<string, unknown>, id: number): Dataset {
  const d = unwrapDataset(raw);
  const blobId = chainText(d.blob_id);
  const network = config.suiNetwork === 'testnet' ? 'testnet' : 'mainnet';
  return {
    id,
    title: bytesToString(d.title),
    blobId,
    sealPolicyId: chainText(d.seal_policy_id),
    priceMist: String(d.price ?? '0'),
    seller: String(d.seller ?? ''),
    createdAt: Number(d.created_at ?? 0),
    walrusUrl: walrusAggregatorUrl(blobId, network),
  };
}

export async function listDatasetsFromChain(): Promise<Dataset[]> {
  if (!config.registryId) return [];

  const client = getSuiClient();
  const obj = await client.getObject({
    id: config.registryId,
    options: { showContent: true },
  });

  if (!obj.data?.content || obj.data.content.dataType !== 'moveObject') {
    return [];
  }

  const fields = obj.data.content.fields as { datasets?: Array<Record<string, unknown>> };
  const datasets = fields.datasets ?? [];
  return datasets.map((d, id) => parseDataset(d, id));
}

export async function getDatasetById(id: number): Promise<Dataset | null> {
  const all = await listDatasetsFromChain();
  return all.find((d) => d.id === id) ?? null;
}
