# Design: MVP Hackathon — Sui Transactions Dataset Marketplace

## Context

TaMind is a greenfield hackathon project (solo builder, ~2 weeks). The README defines the product vision; this design covers the **minimum vertical slice** to demo end-to-end: collect → upload → register → buy → decrypt → verify.

**Constraints:**
- Tatum Sui RPC only (no self-hosted nodes)
- **Seal V2** (`@mysten/seal`) + Walrus are mandatory — encrypt before upload, decrypt via `seal_approve`
- Sui Mainnet preferred for judging bonus
- Spec-first via OpenSpec before any application code

## Goals / Non-Goals

**Goals:**
- One working dataset: Sui Mainnet txs (7-day rolling window) as `.parquet`
- Walrus blob upload with content-addressed blob ID
- Seal V2: `client.seal.encrypt` → Walrus ciphertext → buyer pays escrow → `seal_approve` PTB → `client.seal.decrypt`
- On-chain registry listing blob ID, price, Seal policy ID, seller
- Frontend demo: browse → buy → download → verify blob ID independently
- Tatum API key never exposed to browser (backend proxy)

**Non-Goals:**
- Multi-chain ingestion (Ethereum, BSC, Solana, etc.)
- Dataset versioning / lineage
- Royalty splits, subscriptions, time-lock policies
- Automated cron/scheduled pipeline (manual `run_pipeline.py` for demo)
- Production-grade auth, rate limiting, or indexing at scale
- Tatum MCP as blocking requirement (stretch goal only)

## Decisions

### D1: Monorepo layout with `apps/` + `packages/`

```
apps/web     — React + Vite + @mysten/dapp-kit
apps/api     — Express + TypeScript
contracts/   — Sui Move
pipeline/    — Python CLI
packages/shared — shared TS types + blob-id utils
```

**Rationale:** Separates deployable apps from libraries. `packages/shared` prevents type drift between frontend and API.
**Alternative rejected:** Flat `frontend/` + `backend/` — works but scales poorly when adding shared types.

### D2: Backend proxies all Tatum/Walrus/Seal calls

Browser never holds `TATUM_API_KEY`. Frontend talks to `apps/api`; API injects the key header when calling Tatum Sui RPC.

**Rationale:** Security + simpler CORS. Judges can see Tatum integration in backend logs.
**Alternative rejected:** Frontend direct RPC — exposes API key.

### D3: Seal V2 encrypt-then-store + `seal_approve` payment gate

Flow:
1. Seller: `client.seal.encrypt({ threshold, packageId, id, data })` → upload **ciphertext** to Walrus.
2. Register `blob_id`, `seal_policy_id` (identity `id`), price on-chain.
3. Buyer: `purchase_dataset` → `PurchaseEvent`.
4. Buyer: `SessionKey` + PTB calling `seal_approve(id, purchase_proof)` → `client.seal.decrypt`.

**Rationale:** Seal V2 threshold encryption + Walrus is the hackathon differentiator. Ciphertext on Walrus proves storage integration; `seal_approve` proves programmable access.
**Alternative rejected:** Upload plaintext to Walrus + off-chain ACL — fails Seal requirement and is not tamper-evident for content.

**SDK:** `@mysten/seal` with `SuiClient`/`SuiGrpcClient` + verified key servers from [seal-docs.wal.app](https://seal-docs.wal.app/Pricing#verified-key-servers).
**Move:** `contracts/sources/seal_policy.move` — `seal_approve` entry validating escrow purchase (adapt [subscription pattern](https://github.com/MystenLabs/seal/tree/main/move/patterns/sources/subscription.move)).

### D4: Python pipeline as CLI, not a service

`pipeline/run_pipeline.py --chain sui --window 7d` produces a Parquet file and optionally triggers upload via API or direct Walrus SDK.

**Rationale:** Solo builder; no need for Celery/Airflow. Manual run is fine for hackathon demo.
**Alternative rejected:** Node.js collector — Python is better for Parquet/Pandas.

### D5: Verification runs client-side with aggregator fetch

Frontend downloads blob bytes from Walrus aggregator, recomputes blob ID via shared helper, compares with on-chain registry value.

**Rationale:** "Verify on Walrus" is a judge-visible moment in the demo video. Client-side proves independence from our backend.
**Alternative rejected:** Server-only verify — less convincing for "trustless" narrative.

### D6: Move contract: two modules, one shared object

- `registry.move` — `DatasetRegistry` shared object, `register_dataset`, `list_datasets`
- `escrow.move` — `purchase_dataset`, holds payment, emits `PurchaseEvent`
- `seal_policy.move` — `seal_approve` for Seal V2 key-server authorization

**Rationale:** Minimal surface area. Escrow + registry can share a package.
**Alternative rejected:** Full marketplace with royalties — post-hackathon.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Seal V2 integration complexity | Implement `seal_approve` + encrypt/decrypt spike in task 3.1 before Walrus upload; use testnet key servers first |
| Mainnet gas costs for solo dev | Test on testnet first; publish mainnet before submission |
| Large Parquet blob upload timeout | Cap MVP window to 7 days; compress with Parquet |
| Tatum rate limits during collection | Paginate queries; cache raw JSON locally in pipeline |
| Scope creep | OpenSpec tasks are the contract; defer anything not in `tasks.md` |

## Migration Plan

1. Scaffold directories (no logic)
2. Deploy Move contract → record `PACKAGE_ID` + `REGISTRY_ID` in `.env`
3. Run pipeline → produce first dataset blob on Walrus
4. Register on-chain via API
5. Wire frontend purchase + verify flow
6. Record demo video

**Rollback:** Contracts are immutable once published; use a new package version if needed. Walrus blobs are content-addressed — old blobs remain valid.

## Open Questions

- [ ] Seal V2 key server object IDs for mainnet vs testnet (from verified list)
- [ ] Threshold `t-of-n` config (recommend 2-of-2 or 2-of-3 for demo reliability)
- [ ] Mainnet vs testnet for final submission (mainnet strongly preferred)
