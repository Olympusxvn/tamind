# Proposal: MVP Hackathon — Sui Transactions Dataset Marketplace

## Why

AI developers training on blockchain data have no way to cryptographically prove their datasets haven't been tampered with. TaMind solves this by packaging Sui transaction history as content-addressed Walrus blobs with Seal-gated access and on-chain escrow — but only if we ship a working vertical slice before the June 6 hackathon deadline.

## What Changes

- Introduce a **Sui Mainnet transaction dataset** (rolling 7-day window) as the sole MVP dataset type.
- Build a **Python pipeline** that collects txs via Tatum Sui RPC, normalizes to Parquet; API encrypts with **Seal V2** then uploads ciphertext to Walrus.
- Deploy **Sui Move contracts** (`DatasetRegistry` + escrow) that store blob ID, price, and Seal policy reference on-chain.
- Ship an **Express API** that proxies Tatum RPC (API key server-side), orchestrates Walrus/Seal operations, and submits contract transactions.
- Ship a **React frontend** with browse → buy → decrypt → **Verify on Walrus** flow.
- Add **shared TypeScript types** for cross-module contracts.
- Stretch: Tatum MCP demo query for dataset discovery.

**Explicitly NOT in this change:** multi-chain support, royalties, subscriptions, time-lock Seal policies, automated scheduling, dataset versioning.

## Capabilities

### New Capabilities

- `dataset-ingestion`: Collect Sui txs via Tatum RPC, normalize to AI-ready Parquet
- `walrus-seal-storage`: Seal V2 encrypt → Walrus ciphertext; `seal_approve` payment gate
- `onchain-marketplace`: Sui Move registry + escrow with Seal hook on purchase
- `marketplace-api`: Backend routes for datasets, upload, verify, purchase orchestration
- `marketplace-ui`: React dashboard for discovery, purchase, download, verification
- `blob-verification`: Independent blob-ID recomputation against Walrus aggregator

### Modified Capabilities

*(none — greenfield project)*

## Impact

- **New directories:** `apps/web`, `apps/api`, `contracts`, `pipeline`, `packages/shared`
- **External deps:** Tatum API key, Sui wallet, Walrus testnet/mainnet, Seal SDK
- **On-chain:** New Move package published to Sui Mainnet (preferred) or Testnet
- **Hackathon alignment:** Walrus + Seal core (30%), Tatum RPC (30%), demo video (20%)
