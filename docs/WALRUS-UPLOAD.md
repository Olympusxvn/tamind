# Walrus mainnet upload + registry update

Optional path to replace the **placeholder blob** story with a **real Walrus mainnet blob** and a new on-chain listing. The live Netlify demo ([tamind-hackathon-demo.netlify.app](https://tamind-hackathon-demo.netlify.app)) reads the registry from chain — no Walrus upload runs on Netlify.

**Current demo (unchanged):** dataset `0`, blob ID `tamind_demo_blob_v1`, verify/download fallbacks — see [DEMO.md](./DEMO.md).

---

## Important constraint: registry is append-only

The Move `DatasetRegistry` only supports `register_dataset` (push). There is **no** `update_blob`. Dataset `0` with `tamind_demo_blob_v1` **cannot be updated in place**.

**Practical approach:** upload to Walrus → register a **new listing** (expected ID `1`) → demo that listing on Netlify. Leave dataset `0` as hackathon history.

To replace dataset `0` without a second listing would require a **package upgrade** (`update_dataset` + `AdminCap`) — out of scope for the current MVP contract on mainnet.

Mainnet deploy refs: [contracts/deploy-mainnet.json](../contracts/deploy-mainnet.json)

| Item | Value |
|------|--------|
| Package | `0x4e61ac9692e3bd6dc69cca3d3e8a3efe8b9f46fcef9f5aaeae9d09b9ea1424ef` |
| Registry | `0xa93536944fbfabebbdf49fe801640a086df097edfde736c0ac7f135ac86b014a` |

---

## Architecture

```
Local (one-time)                    Netlify (read-only demo)
─────────────────                   ─────────────────────────
Parquet → POST /api/datasets/upload → Web UI
              ↓                              ↓
         Walrus writeBlob              netlify/functions/api
              ↓                              ↓
    register_dataset_entry          Tatum RPC → registry
              ↓                              ↓
         Sui mainnet                 aggregator.walrus.space
```

Upload and register use **`SUI_PRIVATE_KEY` locally**. Netlify only needs `PACKAGE_ID`, `REGISTRY_ID`, and `TATUM_API_KEY` to list datasets and fetch Walrus bytes for verify/download.

---

## Phase 0 — Wallet and network

| Requirement | Purpose |
|-------------|---------|
| **SUI** | Gas for Walrus tx + register |
| **WAL** | Walrus mainnet storage fee |
| `SUI_PRIVATE_KEY` | Sign upload + register (deploy wallet or new seller) |
| `TATUM_API_KEY` | Read registry in demo |
| `WALRUS_EPOCHS=1` | Lower cost; avoid dry-run abort |
| `WALRUS_SUI_RPC=https://fullnode.mainnet.sui.io:443` | Avoid Tatum 429 during `writeBlob` |

**Past blocker `EStorageExceeded`:** Walrus mainnet epoch capacity (network-wide), not an app bug. Retry at the next epoch; see [Walrus Discord](https://discord.com/invite/walrusprotocol) and [CHANGELOG.md](../CHANGELOG.md).

Check balances before upload:

```bash
sui client balance
```

---

## Phase 1 — Upload + register (local only)

### 1. Configure `apps/api/.env`

```env
SUI_NETWORK=mainnet
TATUM_API_KEY=<your-key>
TATUM_SUI_RPC=https://sui-mainnet.gateway.tatum.io
SUI_PRIVATE_KEY=<deploy-wallet>
PACKAGE_ID=0x4e61ac9692e3bd6dc69cca3d3e8a3efe8b9f46fcef9f5aaeae9d09b9ea1424ef
REGISTRY_ID=0xa93536944fbfabebbdf49fe801640a086df097edfde736c0ac7f135ac86b014a
SEAL_ENABLED=false
WALRUS_EPOCHS=1
WALRUS_SUI_RPC=https://fullnode.mainnet.sui.io:443
```

With `SEAL_ENABLED=false`, the API uploads raw Parquet bytes to Walrus (no Seal encrypt) — sufficient to prove Walrus integration for judges.

### 2. Start API

```bash
npm run dev:api
```

### 3. Upload

**Option A — existing sample Parquet:**

```bash
curl -X POST http://localhost:3001/api/datasets/upload \
  -F "file=@apps/api/assets/sui_tx_demo.parquet" \
  -F "title=Sui Mainnet Transactions (7d) — Walrus" \
  -F "priceMist=1000000000"
```

**Option B — full pipeline:**

```bash
cd pipeline
TAMIND_API_URL=http://localhost:3001 python run_pipeline.py --chain sui --window 7d --upload
```

### 4. Expected response

```json
{
  "blobId": "<walrus-canonical-id>",
  "walrusUrl": "https://aggregator.walrus.space/v1/<blobId>",
  "registerTx": { "digest": "...", "datasetId": 1 },
  "sealEncrypted": false
}
```

Save `blobId`, `datasetId`, and register tx digest.

### 5. Verify locally

```bash
curl http://localhost:3001/api/datasets/1/verify
```

Success:

```json
{
  "walrusAvailable": true,
  "demoMode": false,
  "bytesLength": <non-zero>,
  "onChainVerified": true
}
```

Direct aggregator check:

```bash
curl -I "https://aggregator.walrus.space/v1/<blobId>"
```

Expect `HTTP 200`.

---

## Phase 2 — Netlify demo (no upload on server)

**URL:** https://tamind-hackathon-demo.netlify.app

**Netlify env** (already configured for read-only demo):

| Variable | Value |
|----------|--------|
| `PACKAGE_ID` | mainnet package ID |
| `REGISTRY_ID` | mainnet registry ID |
| `TATUM_API_KEY` | server key |
| `SUI_NETWORK` | `mainnet` |
| `SEAL_ENABLED` | `false` |

After a successful local register, the marketplace **automatically** shows the new listing — no redeploy required unless you change code or env.

**Redeploy** (only when needed):

```bash
CI=true netlify deploy --build --prod --filter @tamind/web
```

### Demo script (Walrus-real listing)

1. Open Netlify — marketplace shows dataset `0` (placeholder) and dataset `1` (Walrus).
2. Open **dataset `1`** — real blob ID and Walrus URL.
3. **Verify** — `walrusAvailable: true` (no demo fallback).
4. **Connect wallet** (mainnet, ≥1 SUI + gas).
5. **Buy** — sign purchase tx.
6. **Download** — UI fetches `dataset.walrusUrl` (not `/demo-file`).
7. Optional: Suiscan registry object + register tx for judges.

**Public API checks:**

```http
GET https://tamind-hackathon-demo.netlify.app/api/datasets
GET https://tamind-hackathon-demo.netlify.app/api/datasets/1/verify
```

---

## Phase 3 — *Best Walrus Integration* narrative

| Before (dataset 0) | After (dataset 1) |
|--------------------|-------------------|
| Blob ID `tamind_demo_blob_v1` | Canonical ID from `writeBlob` |
| Aggregator 404 / fallback | Aggregator HTTP 200 |
| Verify: on-chain + demo mode | Verify: on-chain + Walrus bytes |
| Download via `/demo-file` | Download via Walrus URL |

Dataset `0` can remain as submitted hackathon history; point judges to **dataset `1`** for live Walrus proof.

---

## Troubleshooting

| Error | Action |
|-------|--------|
| `EStorageExceeded` / epoch capacity | Wait for next Walrus epoch; retry |
| Dry run / `inner_mut` abort | Fund WAL; use `WALRUS_EPOCHS=1` |
| `429` during `writeBlob` | Set `WALRUS_SUI_RPC` to public fullnode |
| Upload timeout (120s) | Walrus can take several minutes; retry |
| SDK fails | API falls back to HTTP publisher (`apps/api/src/services/walrus.ts`) |

---

## Checklist

```
[ ] Wallet funded: SUI + WAL on mainnet
[ ] apps/api/.env complete; WALRUS_SUI_RPC = fullnode
[ ] POST /upload OK → blobId + datasetId (e.g. 1)
[ ] GET /api/datasets/1/verify → walrusAvailable: true
[ ] curl aggregator → 200
[ ] Netlify /api/datasets/1/verify → walrusAvailable: true
[ ] Demo video / DevPost: highlight dataset 1 + Walrus verify
```

---

## Related

- [DEMO.md](./DEMO.md) — current placeholder demo (dataset 0)
- [CHANGELOG.md](../CHANGELOG.md) — Walrus lessons learned
- [Hackathon](https://tatum.io/tatum-x-walrus-hackathon) — *Best Walrus Integration* prize
