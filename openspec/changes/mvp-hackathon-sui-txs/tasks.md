# Tasks: MVP Hackathon — Sui Transactions Dataset Marketplace

> Updated after implementation — verify at runtime before demo video.

## 1. Project Scaffold

- [x] 1.1 Create monorepo directories
- [x] 1.2 Add root `.gitignore`, `LICENSE`, `docker-compose.yml`
- [x] 1.3 Initialize `apps/api`
- [x] 1.4 Initialize `apps/web`
- [x] 1.5 Initialize `packages/shared`
- [x] 1.6 Add `.env.example` files

## 2. Smart Contracts

- [x] 2.1 Scaffold Move package
- [x] 2.2 `registry.move`
- [x] 2.3 `escrow.move`
- [x] 2.3b `seal_policy.move`
- [x] 2.4 Move unit test (purchase)
- [x] 2.5 Deploy testnet — see `contracts/deploy-testnet.json`
- [x] 2.6 Deploy mainnet — see `contracts/deploy-mainnet.json`

## 3. Seal V2 + Walrus

- [x] 3.1 `@mysten/seal` + testnet key servers in `.env`
- [x] 3.2 `seal_approve` in Move
- [x] 3.3 `encryptDataset` service
- [x] 3.4 Walrus upload (`@mysten/walrus` writeBlob + HTTP publisher fallback)
- [x] 3.5 `buildSealApproveTxBytes` helper
- [x] 3.6 Seal E2E wired; **disabled in hackathon demo** (`SEAL_ENABLED=false`) — post-hackathon via Enoki (see CHANGELOG.md)

## 4. Data Pipeline

- [x] 4.1 `collectors/sui_tx.py`
- [x] 4.2 `processors/clean.py`
- [x] 4.3 `run_pipeline.py` CLI
- [x] 4.4 `uploaders/walrus.py` (via API)
- [x] 4.5 Run with `TATUM_API_KEY` for live sample (100 txs → Parquet; upload needs WAL for Walrus write)

## 5. Backend API

- [x] 5.1 Tatum RPC proxy `/api/sui/*`
- [x] 5.2 `GET /api/datasets`
- [x] 5.3 `POST /api/datasets/upload`
- [x] 5.4 `POST /api/datasets/:id/purchase`
- [x] 5.5 `GET /api/datasets/:id/verify`
- [x] 5.6 Validation + error handler

## 6. Shared Library

- [x] 6.1 `computeWalrusBlobId()` (Web Crypto SHA-256)
- [x] 6.2 Shared types
- [x] 6.3 Wired into web + api

## 7. Frontend UI

- [x] 7.1 Marketplace grid
- [x] 7.2 Dataset detail
- [x] 7.3 `@mysten/dapp-kit` wallet
- [x] 7.4 Buy flow (sign tx)
- [x] 7.5 Download ciphertext from Walrus URL
- [x] 7.6 Verify on Walrus button
- [x] 7.7 Verify success/failure UI

## 8. Demo & Submission

- [ ] 8.1 Publish real 7d dataset via pipeline + upload (WAL funded — run `--upload`)
- [ ] 8.2 Record demo video (Walrus verify + buy + download; no Seal in demo)
- [ ] 8.3 Tatum MCP stretch — TaMind MCP in `apps/mcp` + [docs/MCP.md](../../docs/MCP.md); pair with official @tatumio/blockchain-mcp
- [ ] 8.4 Submit hackathon form — https://docs.google.com/forms/d/e/1FAIpQLSdOkI-NlBkSHOudVcOXpeDN6h2TQf7f0m9JxA46mhx0Ifm77A/viewform

## 9. Post-Hackathon

- [ ] 9.1–9.4 (deferred)
