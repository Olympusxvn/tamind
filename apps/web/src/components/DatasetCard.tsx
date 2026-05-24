import type { Dataset } from '@tamind/shared';
import { Link } from 'react-router-dom';
import { formatSui } from '../lib/api';

type Props = { dataset: Dataset };

export function DatasetCard({ dataset }: Props) {
  return (
    <Link
      to={`/datasets/${dataset.id}`}
      className="block rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-sui/50 hover:shadow-lg hover:shadow-sui/10"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded bg-walrus/20 px-2 py-0.5 text-xs text-walrus">Walrus</span>
        <span className="rounded bg-seal/20 px-2 py-0.5 text-xs text-seal">Seal V2</span>
      </div>
      <h3 className="text-lg font-semibold text-white">{dataset.title}</h3>
      <p className="mt-2 font-mono text-xs text-slate-400 truncate">blob: {dataset.blobId.slice(0, 16)}…</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sui font-bold">{formatSui(dataset.priceMist)} SUI</span>
        <span className="text-xs text-slate-500">View →</span>
      </div>
    </Link>
  );
}
