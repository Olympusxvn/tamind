import type { VerifyResult } from '@tamind/shared';

type Props = {
  result: VerifyResult | null;
  loading: boolean;
  onVerify: () => void;
};

export function VerifyButton({ result, loading, onVerify }: Props) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-white">Verify dataset</h4>
          <p className="text-sm text-slate-400">
            Confirms the listing exists on Sui mainnet and checks Walrus blob availability.
          </p>
        </div>
        <button
          type="button"
          onClick={onVerify}
          disabled={loading}
          className="rounded-lg bg-walrus px-4 py-2 font-medium text-slate-950 disabled:opacity-50"
        >
          {loading ? 'Verifying…' : 'Verify'}
        </button>
      </div>
      {result && (
        <div
          className={`mt-4 rounded-lg p-3 text-sm ${result.match ? 'bg-emerald-900/40 text-emerald-300' : 'bg-red-900/40 text-red-300'}`}
        >
          {result.demoMode ? (
            <>
              ✅ On-chain listing verified (hackathon demo)
              <p className="mt-2 font-normal opacity-90">
                Walrus blob not on aggregator yet — placeholder blob ID from early register. Sample
                Parquet is served via <span className="font-mono">/api/datasets/0/demo-file</span>{' '}
                after purchase.
              </p>
            </>
          ) : result.walrusAvailable ? (
            <>✅ On-chain listing and Walrus blob available</>
          ) : result.onChainVerified ? (
            <>✅ On-chain listing verified — Walrus blob not found at URL</>
          ) : (
            <>❌ Could not verify dataset</>
          )}
          <div className="mt-2 font-mono text-xs opacity-80">
            on-chain blob ID: {result.onChainBlobId}
            <br />
            {result.walrusAvailable
              ? `Walrus bytes: ${result.bytesLength ?? 0}`
              : 'Walrus: unavailable (mainnet capacity / placeholder)'}
          </div>
        </div>
      )}
    </div>
  );
}
