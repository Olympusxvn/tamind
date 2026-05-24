# TaMind — Hackathon demo (on-chain dataset)

End-to-end demo using the **existing mainnet listing** (no new Walrus upload required).

## On-chain references

| Item | Value |
|------|--------|
| Dataset ID | `0` — **Sui txs 7d** |
| Price | **1 SUI** |
| Blob ID (on-chain) | `tamind_demo_blob_v1` |
| Package | `0x4e61ac9692e3bd6dc69cca3d3e8a3efe8b9f46fcef9f5aaeae9d09b9ea1424ef` |
| Registry | `0xa93536944fbfabebbdf49fe801640a086df097edfde736c0ac7f135ac86b014a` |
| Deploy TX | [suiscan.xyz/mainnet/tx/7ZnvzyT1…](https://suiscan.xyz/mainnet/tx/7ZnvzyT1BU7DN4sbsnYa1sbfg4YZhPNFeBcjgHui7wjA) |
| Registry object | [suiscan.xyz/mainnet/object/0xa935…](https://suiscan.xyz/mainnet/object/0xa93536944fbfabebbdf49fe801640a086df097edfde736c0ac7f135ac86b014a) |

## What works vs pending

| Step | Status |
|------|--------|
| List datasets from chain (Tatum RPC) | ✅ |
| Buy dataset (mainnet tx + PurchaseReceipt) | ✅ |
| Verify on-chain listing | ✅ |
| Verify Walrus blob at aggregator | ⏳ Placeholder blob ID — not on Walrus yet |
| Download sample Parquet | ✅ Fallback `GET /api/datasets/0/demo-file` |
| Seal V2 decrypt | ⏳ Disabled for demo (`SEAL_ENABLED=false`) |

Walrus mainnet upload is blocked by network `EStorageExceeded` — see [CHANGELOG.md](../CHANGELOG.md).

## 1. Start servers

Terminal A — API:

```bash
cd apps/api
cp .env.example .env   # if needed; set TATUM_API_KEY, PACKAGE_ID, REGISTRY_ID
npm run dev            # http://localhost:3001
```

Terminal B — Web:

```bash
npm run dev:web        # http://localhost:5173
```

Quick check:

```bash
curl http://localhost:3001/api/datasets
curl http://localhost:3001/api/datasets/0/verify
```

## 2. Demo script (2–3 min video)

1. Open **http://localhost:5173** — marketplace shows **Sui txs 7d** (1 SUI).
2. Click dataset → show **Blob ID**, **Walrus URL**, seller on **mainnet**.
3. **Verify** → green: *On-chain listing verified (hackathon demo)* — explain Walrus pending.
4. **Connect wallet** (Sui mainnet, ≥1 SUI + gas).
5. **Buy dataset** → sign tx → show **PurchaseReceipt** in UI.
6. **Download dataset** → Parquet (100 recent mainnet txs via Tatum pipeline sample).
7. Optional: open **Suiscan** registry + purchase tx for judges.

## 3. API endpoints (demo)

```http
GET /api/datasets
GET /api/datasets/0
GET /api/datasets/0/verify
GET /api/datasets/0/demo-file
POST /api/datasets/0/purchase
```

## 4. Submit hackathon

[Submission form](https://docs.google.com/forms/d/e/1FAIpQLSdOkI-NlBkSHOudVcOXpeDN6h2TQf7f0m9JxA46mhx0Ifm77A/viewform)

Include: repo URL, demo video, mainnet Package ID, Tatum gateway usage.
