import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSignPersonalMessage,
  useSuiClient,
} from '@mysten/dapp-kit';
import { VerifyButton } from '../components/VerifyButton';
import { TatumKeySettings } from '../components/TatumKeySettings';
import {
  fetchDemoFile,
  fetchDataset,
  fetchDecryptParams,
  fetchPurchaseTx,
  fetchSealApproveTx,
  formatSui,
} from '../lib/api';
import { decryptDatasetBlob } from '../lib/seal-decrypt';
import { verifyDataset } from '../lib/verify';
import type { Dataset, DecryptParams, VerifyResult } from '@tamind/shared';

function findPurchaseReceiptId(
  objectChanges: Array<{ type?: string; objectType?: string; objectId?: string }> | null | undefined,
): string | null {
  if (!objectChanges) return null;
  for (const change of objectChanges) {
    if (
      change.type === 'created' &&
      change.objectType?.includes('PurchaseReceipt') &&
      change.objectId
    ) {
      return change.objectId;
    }
  }
  return null;
}

export function DatasetDetailPage() {
  const { id } = useParams();
  const datasetId = Number(id);
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();

  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [sealEnabled, setSealEnabled] = useState(false);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(datasetId)) return;
    fetchDataset(datasetId).then(setDataset).catch(console.error);
    fetchDecryptParams(datasetId)
      .then((p) => setSealEnabled(Boolean(p.sealEnabled)))
      .catch(() => setSealEnabled(false));
  }, [datasetId]);

  async function handleBuy() {
    if (!account || !dataset) return;
    setStatus('Building purchase transaction…');
    try {
      const payload = await fetchPurchaseTx(dataset.id);
      if (payload.demo) {
        setStatus('Demo mode: configure PACKAGE_ID for on-chain purchase.');
        return;
      }
      setStatus('Sign purchase in wallet…');
      const result = await signAndExecute({ transaction: payload.transactionBlock });
      const tx = await client.waitForTransaction({
        digest: result.digest,
        options: { showObjectChanges: true },
      });
      const rid = findPurchaseReceiptId(tx.objectChanges);
      if (!rid) {
        setStatus(`Purchase confirmed (${result.digest}) but PurchaseReceipt not found in effects.`);
        return;
      }
      setReceiptId(rid);
      setStatus(
        sealEnabled
          ? `Purchase confirmed. Receipt ${rid.slice(0, 10)}… — Seal decrypt ready.`
          : `Purchase confirmed. Use Download dataset (Walrus or demo Parquet).`,
      );
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Purchase failed');
    }
  }

  async function handleDecrypt() {
    if (!account || !dataset || !receiptId) {
      setStatus('Purchase the dataset first to receive a PurchaseReceipt.');
      return;
    }
    setStatus('Fetching ciphertext from Walrus…');
    try {
      const decryptParams = (await fetchDecryptParams(dataset.id)) as DecryptParams;
      const walrusRes = await fetch(dataset.walrusUrl);
      if (!walrusRes.ok) throw new Error('Walrus blob not available');
      const encryptedBytes = new Uint8Array(await walrusRes.arrayBuffer());

      setStatus('Requesting Seal key release (SessionKey + seal_approve)…');
      const sealApproveTxBase64 = await fetchSealApproveTx(dataset.id, receiptId);
      const plaintext = await decryptDatasetBlob({
        encryptedBytes,
        decryptParams,
        receiptId,
        buyerAddress: account.address,
        suiClient: client as never,
        sealApproveTxBase64,
        signPersonalMessage,
      });

      const blob = new Blob([Uint8Array.from(plaintext)], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataset.title.replace(/\s+/g, '_')}.parquet`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus('Decrypted Parquet downloaded.');
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Decrypt failed');
    }
  }

  async function handleVerify() {
    if (!dataset) return;
    setVerifyLoading(true);
    try {
      const result = await verifyDataset(dataset.id);
      setVerifyResult(result);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Verify failed');
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleDownload() {
    if (!dataset) return;
    setStatus('Fetching from Walrus…');
    try {
      const res = await fetch(dataset.walrusUrl);
      if (res.ok) {
        const blob = await res.blob();
        if (blob.size > 0) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${dataset.title.replace(/\s+/g, '_')}.parquet.enc`;
          a.click();
          URL.revokeObjectURL(url);
          setStatus('Downloaded from Walrus aggregator.');
          return;
        }
      }
    } catch {
      /* fall through to demo file */
    }

    setStatus('Walrus unavailable — downloading hackathon demo Parquet…');
    try {
      const res = await fetchDemoFile(dataset.id);
      if (!res.ok) throw new Error('Demo file not found on API');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataset.title.replace(/\s+/g, '_')}.parquet`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus('Downloaded demo Parquet (100 Sui txs sample). Walrus upload pending mainnet capacity.');
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Download failed');
    }
  }

  if (!dataset) {
    return <p className="text-slate-400">Loading dataset…</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="text-sm text-sui hover:underline">
          ← Back to marketplace
        </Link>
        <TatumKeySettings />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h1 className="text-2xl font-bold">{dataset.title}</h1>
        <p className="mt-2 text-3xl font-semibold text-sui">{formatSui(dataset.priceMist)} SUI</p>

        <dl className="mt-6 space-y-3 font-mono text-sm">
          <div>
            <dt className="text-slate-500">Blob ID</dt>
            <dd className="break-all text-slate-200">{dataset.blobId}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Seal policy ID</dt>
            <dd className="break-all text-seal">{dataset.sealPolicyId}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Seller</dt>
            <dd className="break-all text-slate-300">{dataset.seller}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Walrus URL</dt>
            <dd className="break-all text-walrus">
              <a href={dataset.walrusUrl} target="_blank" rel="noreferrer" className="hover:underline">
                {dataset.walrusUrl}
              </a>
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <ConnectButton />
          <button
            type="button"
            onClick={handleBuy}
            disabled={!account}
            className="rounded-lg bg-sui px-4 py-2 font-medium text-slate-950 disabled:opacity-40"
          >
            Buy dataset
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-lg border border-walrus px-4 py-2 text-walrus"
          >
            {sealEnabled ? 'Download ciphertext' : 'Download dataset'}
          </button>
          {sealEnabled ? (
            <button
              type="button"
              onClick={handleDecrypt}
              disabled={!account || !receiptId}
              className="rounded-lg border border-seal px-4 py-2 text-seal disabled:opacity-40"
            >
              Decrypt (Seal V2)
            </button>
          ) : null}
        </div>


        {!sealEnabled && (
          <p className="mt-3 text-xs text-slate-500">
            Seal V2 decrypt is disabled for the hackathon demo — see CHANGELOG.md (post-hackathon + Enoki).
          </p>
        )}

        {receiptId && (
          <p className="mt-3 font-mono text-xs text-slate-500">PurchaseReceipt: {receiptId}</p>
        )}
        {status && <p className="mt-4 text-sm text-slate-400">{status}</p>}
      </div>

      <div className="mt-6">
        <VerifyButton result={verifyResult} loading={verifyLoading} onVerify={handleVerify} />
      </div>
    </div>
  );
}
