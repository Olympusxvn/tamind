import { useEffect, useState } from 'react';
import {
  clearStoredTatumApiKey,
  getStoredTatumApiKey,
  hasStoredTatumApiKey,
  setStoredTatumApiKey,
} from '../lib/tatum-key-storage';

export function TatumKeySettings() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [saved, setSaved] = useState(hasStoredTatumApiKey());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(getStoredTatumApiKey() ?? '');
      setError(null);
    }
  }, [open]);

  function handleSave() {
    try {
      setStoredTatumApiKey(draft);
      setSaved(true);
      setError(null);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid key');
    }
  }

  function handleClear() {
    clearStoredTatumApiKey();
    setDraft('');
    setSaved(false);
    setError(null);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-slate-500 hover:text-slate-100"
      >
        {saved ? 'Tatum API key ✓' : 'Tatum API key'}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-labelledby="tatum-key-title"
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="tatum-key-title" className="text-lg font-semibold text-slate-100">
              Custom Tatum API key
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Optional. Use your Tatum API key from{' '}
              <a
                href="https://dashboard.tatum.io"
                target="_blank"
                rel="noreferrer"
                className="text-sui hover:underline"
              >
                dashboard.tatum.io
              </a>{' '}
              for RPC and on-chain reads via this app. Stored only in your browser.
            </p>

            <label className="mt-4 block text-sm text-slate-500" htmlFor="tatum-api-key-input">
              API key
            </label>
            <input
              id="tatum-api-key-input"
              type="password"
              autoComplete="off"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Paste your Tatum API key"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-sui focus:outline-none"
            />

            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg bg-sui px-4 py-2 text-sm font-medium text-slate-950"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
