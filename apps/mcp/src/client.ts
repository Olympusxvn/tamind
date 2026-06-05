import type { Dataset, VerifyResult } from '@tamind/shared';

const TATUM_HEADER = 'X-Tatum-Api-Key';

function baseUrl(): string {
  const url = (process.env.TAMIND_API_URL ?? 'https://tamind-hackathon-demo.netlify.app').replace(/\/$/, '');
  return url;
}

function headers(): HeadersInit {
  const h: Record<string, string> = { Accept: 'application/json' };
  const key = process.env.TATUM_API_KEY?.trim();
  if (key) h[TATUM_HEADER] = key;
  return h;
}

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`TaMind API ${res.status}: ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function listDatasets(): Promise<Dataset[]> {
  const data = await parseJson<{ datasets: Dataset[] }>(
    await fetch(`${baseUrl()}/api/datasets`, { headers: headers() }),
  );
  return data.datasets;
}

export async function getDataset(id: number): Promise<Dataset> {
  const data = await parseJson<{ dataset: Dataset }>(
    await fetch(`${baseUrl()}/api/datasets/${id}`, { headers: headers() }),
  );
  return data.dataset;
}

export async function verifyDataset(id: number): Promise<VerifyResult> {
  return parseJson<VerifyResult>(
    await fetch(`${baseUrl()}/api/datasets/${id}/verify`, { headers: headers() }),
  );
}

export function searchDatasets(datasets: Dataset[], query: string): Dataset[] {
  const q = query.trim().toLowerCase();
  if (!q) return datasets;
  return datasets.filter(
    (d) =>
      d.title.toLowerCase().includes(q) ||
      d.blobId.toLowerCase().includes(q) ||
      d.seller.toLowerCase().includes(q),
  );
}
