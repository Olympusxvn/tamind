"""Normalize raw Sui txs to Parquet."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pyarrow as pa
import pyarrow.parquet as pq


def _row(tx: dict[str, Any]) -> dict[str, Any]:
    effects = tx.get("effects") or {}
    status = (effects.get("status") or {}).get("status", "unknown")
    gas = (effects.get("gasUsed") or {})
    return {
        "digest": tx.get("digest", ""),
        "sender": (tx.get("transaction") or {}).get("data", {}).get("sender", ""),
        "timestamp_ms": int(tx.get("timestampMs") or 0),
        "gas_computation": int(gas.get("computationCost") or 0),
        "gas_storage": int(gas.get("storageCost") or 0),
        "status": status,
    }


def to_parquet(txs: list[dict[str, Any]], out_path: Path) -> Path:
    if not txs:
        raise ValueError("No transactions to export")
    rows = [_row(tx) for tx in txs]
    table = pa.Table.from_pylist(rows)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    pq.write_table(table, out_path)
    return out_path
