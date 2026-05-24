import { useEffect, useState } from 'react';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { DatasetCard } from '../components/DatasetCard';
import { fetchDatasets } from '../lib/api';
import type { Dataset } from '@tamind/shared';

export function MarketplacePage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const account = useCurrentAccount();

  useEffect(() => {
    fetchDatasets()
      .then(setDatasets)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'));
  }, []);

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-sui">Ta</span>Mind Marketplace
          </h1>
          <p className="mt-1 text-slate-400">Verifiable Sui transaction datasets · Walrus + Seal V2</p>
        </div>
        <ConnectButton />
      </header>

      {account && (
        <p className="mb-4 text-sm text-slate-500">Connected: {account.address.slice(0, 10)}…</p>
      )}

      {error && <p className="text-red-400">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {datasets.map((d) => (
          <DatasetCard key={d.id} dataset={d} />
        ))}
      </div>

      {datasets.length === 0 && !error && (
        <p className="text-slate-500">No datasets yet. Run the pipeline or configure REGISTRY_ID.</p>
      )}
    </div>
  );
}
