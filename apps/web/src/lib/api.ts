import type { Dataset, VerifyResult } from '@tamind/shared';
import { getStoredTatumApiKey } from './tatum-key-storage';

const API = import.meta.env.VITE_API_URL ?? '';

export const TATUM_API_KEY_HEADER = 'X-Tatum-Api-Key';

function apiHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  const key = getStoredTatumApiKey();
  if (key) headers.set(TATUM_API_KEY_HEADER, key);
  return headers;
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = apiHeaders(init?.headers);
  return fetch(`${API}${path}`, { ...init, headers });
}

export async function fetchDatasets(): Promise<Dataset[]> {
  const res = await apiFetch('/api/datasets');
  if (!res.ok) throw new Error('Failed to load datasets');
  const data = await res.json();
  return data.datasets;
}

export async function fetchDataset(id: number): Promise<Dataset> {
  const res = await apiFetch(`/api/datasets/${id}`);
  if (!res.ok) throw new Error('Dataset not found');
  const data = await res.json();
  return data.dataset;
}

export async function fetchPurchaseTx(id: number) {
  const res = await apiFetch(`/api/datasets/${id}/purchase`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to build purchase tx');
  return res.json();
}

export async function fetchVerifyMeta(id: number): Promise<VerifyResult> {
  const res = await apiFetch(`/api/datasets/${id}/verify`);
  if (!res.ok) throw new Error('Verify failed');
  return res.json();
}

export function demoFileUrl(id: number): string {
  return `${API}/api/datasets/${id}/demo-file`;
}

export async function fetchDecryptParams(id: number) {
  const res = await apiFetch(`/api/datasets/${id}/decrypt-params`);
  if (!res.ok) throw new Error('Failed to load decrypt params');
  return res.json();
}

export async function fetchSealApproveTx(id: number, receiptId: string): Promise<string> {
  const res = await apiFetch(`/api/datasets/${id}/seal-approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiptId }),
  });
  if (!res.ok) throw new Error('Failed to build seal_approve transaction');
  const data = await res.json();
  return data.transactionBlock as string;
}

/** Fetch demo Parquet with optional user Tatum key (for registry-backed routes). */
export async function fetchDemoFile(id: number): Promise<Response> {
  return apiFetch(`/api/datasets/${id}/demo-file`);
}

export function formatSui(mist: string): string {
  return (Number(mist) / 1e9).toFixed(2);
}
