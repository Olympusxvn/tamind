#!/usr/bin/env python3
"""TaMind data pipeline — collect Sui txs → Parquet → optional API upload."""

from __future__ import annotations

import argparse
import sys
from datetime import datetime
from pathlib import Path

from collectors.sui_tx import collect_window
from processors.clean import to_parquet
from uploaders.walrus import upload_via_api


def main() -> int:
    parser = argparse.ArgumentParser(description="TaMind Sui transaction dataset pipeline")
    parser.add_argument("--chain", default="sui", choices=["sui"])
    parser.add_argument("--window", default="7d", help="Rolling window label (MVP: paginated recent txs)")
    parser.add_argument("--out", default="out", help="Output directory")
    parser.add_argument("--upload", action="store_true", help="Upload via TaMind API")
    parser.add_argument("--price-mist", default="1000000000")
    args = parser.parse_args()

    if args.chain != "sui":
        print("MVP supports --chain sui only", file=sys.stderr)
        return 1

    print(f"Collecting Sui transactions ({args.window})…")
    txs = collect_window(max_pages=2)
    if not txs:
        print("No transactions collected", file=sys.stderr)
        return 1

    out_dir = Path(args.out)
    stamp = datetime.utcnow().strftime("%Y%m%d")
    parquet_path = out_dir / f"sui_tx_{args.window}_{stamp}.parquet"
    to_parquet(txs, parquet_path)
    print(f"Wrote {parquet_path} ({len(txs)} rows)")

    if args.upload:
        title = f"Sui Mainnet Transactions ({args.window})"
        result = upload_via_api(parquet_path, title, args.price_mist)
        print("Upload result:", result)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
