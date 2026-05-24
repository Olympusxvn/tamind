"""Fetch Sui transaction blocks via Tatum Sui JSON-RPC."""

from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.request
from typing import Any


def _rpc(method: str, params: list[Any], retries: int = 5) -> Any:
    url = os.environ.get("TATUM_SUI_RPC", "https://sui-mainnet.gateway.tatum.io")
    api_key = os.environ.get("TATUM_API_KEY", "")
    body = json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params}).encode()
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["x-api-key"] = api_key

    last_error: Exception | None = None
    for attempt in range(retries):
        req = urllib.request.Request(url, data=body, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                data = json.loads(resp.read())
            if "error" in data:
                raise RuntimeError(data["error"])
            return data["result"]
        except urllib.error.HTTPError as exc:
            last_error = exc
            if exc.code == 429 and attempt + 1 < retries:
                time.sleep(2 ** attempt)
                continue
            raise
        except RuntimeError as exc:
            last_error = exc
            msg = str(exc)
            if ("429" in msg or "Too many requests" in msg) and attempt + 1 < retries:
                time.sleep(2 ** attempt + 2)
                continue
            raise
    if last_error:
        raise last_error
    raise RuntimeError("RPC request failed")


def fetch_recent_transactions(limit: int = 50, cursor: str | None = None) -> tuple[list[dict], str | None]:
    query = {
        "options": {
            "showInput": True,
            "showEffects": True,
            "showEvents": True,
        },
    }
    result = _rpc("suix_queryTransactionBlocks", [query, cursor, limit, True])
    txs = result.get("data", [])
    return txs, result.get("nextCursor")


def collect_window(max_pages: int = 5, page_size: int = 50) -> list[dict]:
    all_txs: list[dict] = []
    cursor = None
    for _ in range(max_pages):
        batch, cursor = fetch_recent_transactions(limit=page_size, cursor=cursor)
        all_txs.extend(batch)
        if not cursor or not batch:
            break
    return all_txs
