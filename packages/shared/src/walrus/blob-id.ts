export function walrusAggregatorUrl(blobId: string, network: 'mainnet' | 'testnet' = 'mainnet'): string {
  const base =
    network === 'testnet'
      ? 'https://aggregator.walrus-testnet.walrus.space/v1'
      : 'https://aggregator.walrus.space/v1';
  return `${base}/${blobId}`;
}

/** SHA-256 hex — works in browser (Web Crypto) and Node 20+. */
export async function computeWalrusBlobId(bytes: Uint8Array): Promise<string> {
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
