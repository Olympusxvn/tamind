<div align="center">

# 🧠 TaMind

### Verifiable AI Dataset Marketplace on Sui

**Trust your data. Verify it. Train with confidence.**

The first marketplace where every AI-ready blockchain dataset is **content-addressed on Walrus**, **access-controlled by Seal**, and **escrowed by Sui smart contracts** — powered by **Tatum**'s Sui RPC and Data API.

[![Sui](https://img.shields.io/badge/Built%20on-Sui-4DA2FF?style=flat-square)](https://sui.io)
[![Walrus](https://img.shields.io/badge/Storage-Walrus-00C2FF?style=flat-square)](https://walrus.xyz)
[![Seal V2](https://img.shields.io/badge/Encryption-Seal%20V2-7E57C2?style=flat-square)](https://seal-docs.wal.app/)
[![Tatum](https://img.shields.io/badge/Powered%20by-Tatum-FF6B35?style=flat-square)](https://tatum.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

🏆 *Submission for the **Tatum × Build on Sui with Walrus Hackathon** — May 23 → June 6, 2026*

</div>

---

## ⚡ TL;DR

AI teams cannot **prove** their blockchain training data hasn't been tampered with.
TaMind fixes this by **encrypting datasets with Seal V2**, storing **ciphertext on Walrus**, gating decryption through **`seal_approve` on-chain policies**, and brokering payments via **Sui smart contracts** — all sourced from **Tatum's Sui RPC**.

> **Buy a dataset. Verify the blob ID. Train with cryptographic confidence.**

---

## 🎯 The Problem

> 60% of AI projects fail due to data quality and provenance issues — *Gartner, 2024*

Three concrete pains for AI teams working with on-chain data:

| # | Pain | Today's Status Quo |
|---|------|--------------------|
| 1 | **No provenance** | RPC-sourced data has no cryptographic guarantee. Auditors, regulators, and enterprise customers can't independently verify a dataset hasn't been mutated. |
| 2 | **Expensive pipelines** | A typical AI startup burns ~$5k–20k/month maintaining multi-chain RPCs, ETL scripts, and versioned dataset storage. |
| 3 | **No reproducibility** | Datasets shift over time (re-orgs, forks, indexer changes). Research published today can't be reproduced six months later. |

---

## 💡 The TaMind Solution

| Problem | TaMind |
|---------|--------|
| Can't verify data | **Content-addressed blob IDs** on Walrus — any byte change ⇒ different ID |
| Costly pipelines | **Ready-to-train datasets** (CSV / Parquet / JSON) — download via HTTPS in seconds |
| Not reproducible | **Immutable blob IDs** — cite the ID in a paper, anyone re-downloads the *exact* bytes forever |
| Trust between buyer & seller | **Sui escrow + Seal V2** — pay on-chain, `seal_approve` releases decryption keys |

---

## 🎬 Demo (on-chain dataset)

**Live app:** [tamind-hackathon-demo.netlify.app](https://tamind-hackathon-demo.netlify.app) — connect a Sui mainnet wallet, or open **Tatum API key** in the header to use your own [Tatum](https://dashboard.tatum.io) key for RPC.

Step-by-step walkthrough: **[docs/DEMO.md](docs/DEMO.md)** · AI agents: **[docs/MCP.md](docs/MCP.md)**.

## 🚀 MVP Scope (Hackathon Deliverable)

For the hackathon, TaMind ships a **vertical slice that works end-to-end on Sui Mainnet**:

✅ **Single dataset type** — *Sui Mainnet transactions (rolling window)*
✅ **Tatum Sui RPC** as the sole data source (`https://sui-mainnet.gateway.tatum.io`); optional **user API key** in the live app header
✅ **Walrus integration** — `@mysten/walrus` upload path + API wired (`POST /api/datasets/upload`)
⏳ **Walrus mainnet blob (live listing)** — demo registry uses placeholder blob ID; real upload blocked by network capacity — see [docs/DEMO.md](docs/DEMO.md)
✅ **Sui Move marketplace contract** — `DatasetRegistry` + escrow on mainnet
✅ **React frontend** — browse → buy → verify → download ([live demo](https://tamind-hackathon-demo.netlify.app))
✅ **Verify button** — on-chain listing check + Walrus aggregator fetch (demo mode when blob is placeholder)
⏳ **Seal V2** — Move `seal_approve` + API/UI wired; **disabled in hackathon demo** (mainnet key servers via Enoki only — see [CHANGELOG.md](CHANGELOG.md))
✅ **TaMind MCP** — `apps/mcp` tools for AI dataset discovery; setup in **[docs/MCP.md](docs/MCP.md)** (pair with [Tatum MCP](https://github.com/tatumio/blockchain-mcp))

Everything else (multi-chain, royalties, subscriptions, time-lock policies, automated daily pipelines) is **explicitly deferred** — see [Roadmap](#-roadmap).

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  AI Dev / Researcher / Agent                  │
└───────────────────────────┬──────────────────────────────────┘
                            │ browse / buy / verify
                            ▼
┌──────────────────────────────────────────────────────────────┐
│         TaMind Frontend  (React + TypeScript)                 │
│         TaMind Backend   (Node.js + Express)                  │
└───────┬────────────────────┬─────────────────────────┬───────┘
        │                    │                         │
        │ on-chain ops       │ data fetch              │ blob ops
        ▼                    ▼                         ▼
┌──────────────┐   ┌────────────────────┐   ┌────────────────────┐
│  Sui Move    │   │   Tatum Sui RPC    │   │   Seal V2 + Walrus │
│  Contracts   │   │   + Data API       │   │   (@mysten/seal)   │
│ • Registry   │   │ • on-chain queries │   │ • encrypt (V2)     │
│ • Escrow     │   │ • tx history       │   │ • Walrus ciphertext│
│ • seal_approve│  │ • indexed events   │   │ • content-address  │
└──────────────┘   └────────────────────┘   └────────────────────┘
        │                                            ▲
        └──── seal_approve ← PurchaseEvent ────────────┘
```

**Data flow in one line:**
`Tatum RPC → Parquet → Seal V2 encrypt → Walrus (ciphertext) → Sui registry → Buy → seal_approve → decrypt → Verify blob ID`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Blockchain** | Sui (Mainnet) |
| **RPC / Data** | Tatum Sui RPC + Data API |
| **Storage** | Walrus (decentralized blob storage) |
| **Encryption** | Seal V2 (`@mysten/seal`, threshold + `seal_approve`) |
| **Smart Contracts** | Sui Move |
| **Backend** | Node.js · Express · TypeScript |
| **Frontend** | React · TypeScript · TailwindCSS · `@mysten/dapp-kit` |
| **Data Pipeline** | Python · Pandas · PyArrow |
| **AI Gateway** | TaMind MCP (`apps/mcp`) + [Tatum MCP](https://github.com/tatumio/blockchain-mcp) |

---

## 🔄 End-to-End Flow

1. **Collect** — Pipeline calls Tatum Sui RPC for a window of mainnet transactions.
2. **Process** — Python normalizes the data and exports `.parquet`.
3. **Encrypt** — API calls `client.seal.encrypt` (threshold, `packageId`, policy `id`).
4. **Upload** — Ciphertext goes to Walrus; blob ID returned.
5. **Register** — `register_dataset(blob_id, price, seal_policy_id)` on Sui.
6. **Discover** — Frontend lists datasets from on-chain registry.
7. **Purchase** — Buyer pays escrow; `PurchaseEvent` emitted.
8. **Decrypt** — `SessionKey` + wallet sign → PTB `seal_approve` → `client.seal.decrypt` → Parquet.
9. **Verify** — On-chain blob ID vs Walrus aggregator (full match when a real blob is on Walrus; demo mode otherwise — see [docs/DEMO.md](docs/DEMO.md)).

---

## 🚦 Quickstart

> Prerequisites: Node 20+, Python 3.10+, a [Tatum API key](https://dashboard.tatum.io), a Sui wallet (Sui Wallet / Suiet) with SUI for gas.

### 1. Clone & read specs first

```bash
git clone https://github.com/Olympusxvn/tamind.git
cd tamind

# Read before coding — spec-driven workflow
cat CLAUDE.md
cat openspec/changes/mvp-hackathon-sui-txs/proposal.md
cat openspec/changes/mvp-hackathon-sui-txs/tasks.md
```

### 2. Install agent tooling (one-time)

```bash
npx @fission-ai/openspec@latest init --tools cursor   # OpenSpec slash commands
npx skills@latest add mattpocock/skills                 # Baseline agent skills

# After monorepo scaffold (23/05+) — auto-detect stack for Cursor:
npx autoskills -y -a cursor
```

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for the full 23/05 → 06/06 workflow.

### On-chain deployment (Sui Mainnet)

| | |
|---|---|
| **Package ID** | `0x4e61ac9692e3bd6dc69cca3d3e8a3efe8b9f46fcef9f5aaeae9d09b9ea1424ef` |
| **Registry ID** | `0xa93536944fbfabebbdf49fe801640a086df097edfde736c0ac7f135ac86b014a` |
| **Deploy TX** | [suiscan.xyz/mainnet/tx/7ZnvzyT1…](https://suiscan.xyz/mainnet/tx/7ZnvzyT1BU7DN4sbsnYa1sbfg4YZhPNFeBcjgHui7wjA) |

Full manifest: [`contracts/deploy-mainnet.json`](contracts/deploy-mainnet.json) · Testnet: [`contracts/deploy-testnet.json`](contracts/deploy-testnet.json)

Copy into `apps/api/.env`:

```bash
PACKAGE_ID=0x4e61ac9692e3bd6dc69cca3d3e8a3efe8b9f46fcef9f5aaeae9d09b9ea1424ef
REGISTRY_ID=0xa93536944fbfabebbdf49fe801640a086df097edfde736c0ac7f135ac86b014a
```

### 3. Run the apps (after scaffold — see tasks.md)

```bash
# API
cd apps/api
cp .env.example .env          # TATUM_API_KEY, SUI_PRIVATE_KEY, PACKAGE_ID
npm install && npm run dev    # http://localhost:3001

# Web (new terminal)
cd apps/web
npm install && npm run dev    # http://localhost:5173

# Pipeline (new terminal — publish a dataset)
cd pipeline
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python run_pipeline.py --chain sui --window 7d
```

### 4. Deploy Move contracts (optional — already on mainnet)

Already deployed — use the [Package ID above](#on-chain-deployment-sui-mainnet). To redeploy:

```bash
cd contracts
sui move build
sui client publish --gas-budget 100000000
# update PACKAGE_ID + REGISTRY_ID in apps/api/.env
```

### 5. Implement via OpenSpec

```text
/opsx:apply    # work through openspec/changes/mvp-hackathon-sui-txs/tasks.md
/opsx:archive  # merge specs when MVP is complete
```

---

## 🧪 Code Snippets

### Fetch Sui transactions via Tatum RPC

```typescript
import { SuiClient } from '@mysten/sui/client';

const client = new SuiClient({
  url: 'https://sui-mainnet.gateway.tatum.io',
  // header injected by backend proxy: x-api-key: <TATUM_API_KEY>
});

const txs = await client.queryTransactionBlocks({
  filter: { FromAddress: '0x...' },
  options: { showEffects: true, showInput: true },
});
```

### Seal V2 encrypt → Walrus upload

```typescript
import { SuiClient } from '@mysten/sui/client';
import { seal } from '@mysten/seal';
import { WalrusClient } from '@mysten/walrus';

const sui = new SuiClient({ url: 'https://sui-mainnet.gateway.tatum.io' /* + x-api-key */ });
const client = sui.$extend(seal({
  serverConfigs: [
    { objectId: KEY_SERVER_ID, weight: 1 },  // from seal-docs.wal.app
  ],
}));

const parquet = fs.readFileSync('./out/sui_tx_7d.parquet');
const policyId = crypto.randomBytes(32); // registered on-chain as seal identity

const { encryptedObject } = await client.seal.encrypt({
  threshold: 2,
  packageId: PACKAGE_ID,
  id: policyId,
  data: parquet,
});

const blob = await walrus.writeBlob({ blob: encryptedObject, epochs: 10, deletable: false });
console.log('blobId:', blob.blobId);       // ciphertext on Walrus
console.log('policyId:', policyId);        // seal_approve identity
```

### Verify a downloaded blob

```typescript
const downloaded = await fetch(`https://aggregator.walrus.space/v1/${blobId}`)
  .then(r => r.arrayBuffer());

const recomputed = await computeWalrusBlobId(new Uint8Array(downloaded));
assert(recomputed === onChainBlobId, '❌ tampered dataset');
```

---

## 📁 Project Structure

Spec-first monorepo. **Read `openspec/` before writing application code.**

```
tamind/
│
├── CLAUDE.md                          # AI agent rules (Karpathy + TaMind context)
├── README.md
├── LICENSE
├── netlify.toml                       # Netlify build + API function + SPA redirects
│
├── openspec/                          # OpenSpec — agree before building
│   ├── specs/                         # Source of truth (merged after /opsx:archive)
│   └── changes/
│       └── mvp-hackathon-sui-txs/     # Active MVP change
│           ├── proposal.md            # Why & what
│           ├── design.md              # Architecture decisions
│           ├── tasks.md               # Implementation checklist (/opsx:apply)
│           └── specs/                 # Requirements per capability
│               ├── dataset-ingestion/
│               ├── walrus-seal-storage/
│               ├── onchain-marketplace/
│               ├── marketplace-api/
│               ├── marketplace-ui/
│               └── blob-verification/
│
├── .cursor/                           # OpenSpec slash commands (Cursor)
│   ├── commands/                      # /opsx:propose · apply · archive · explore
│   └── skills/
│
├── .agents/                           # Agent skills (mattpocock/skills via npx)
│   └── skills/                        # tdd · to-prd · prototype · diagnose · …
│
├── apps/
│   ├── web/                           # React + Vite marketplace UI
│   │   ├── src/
│   │   │   ├── components/            # DatasetCard · VerifyButton · TatumKeySettings
│   │   │   ├── pages/                 # Marketplace · DatasetDetail
│   │   │   └── lib/                   # API client · Tatum key storage (localStorage)
│   │   ├── index.html
│   │   └── package.json
│   │
│   └── api/                           # Express + TypeScript backend
│       ├── assets/                    # Demo Parquet for /demo-file
│       ├── src/
│       │   ├── routes/                # /datasets · /upload · /verify · /sui/*
│       │   ├── services/              # seal-v2.ts · walrus.ts · sui.ts · registry.ts
│       │   └── lib/                   # Per-request Tatum API key resolution
│       ├── .env.example
│       └── package.json
│   │
│   └── mcp/                           # MCP server — AI dataset discovery tools
│       ├── src/
│       └── package.json
│
├── contracts/                         # Sui Move smart contracts
│   ├── sources/
│   │   ├── registry.move              # DatasetRegistry shared object
│   │   ├── escrow.move                # purchase_dataset + PurchaseEvent
│   │   └── seal_policy.move           # seal_approve (Seal V2 access gate)
│   ├── tests/
│   └── Move.toml
│
├── pipeline/                          # Python CLI — collect → process → upload
│   ├── collectors/
│   │   └── sui_tx.py                  # Tatum Sui RPC → raw JSON
│   ├── processors/
│   │   └── clean.py                   # normalize → Parquet
│   ├── uploaders/
│   │   └── walrus.py                  # upload ciphertext (encrypt via API)
│   ├── run_pipeline.py                # CLI entry: --chain sui --window 7d
│   └── requirements.txt
│
├── packages/
│   └── shared/                        # Cross-app TypeScript library
│       ├── src/
│       │   ├── types/                 # Dataset · PurchaseEvent · VerifyResult
│       │   └── walrus/                # computeWalrusBlobId()
│       └── package.json
│
├── netlify/
│   └── functions/                     # Serverless Express API for Netlify deploy
│
└── docs/
    ├── DEMO.md                        # Live demo script + on-chain refs
    ├── MCP.md                         # TaMind + Tatum MCP for AI agents
    ├── DEVELOPMENT.md                 # Hackathon workflow
    └── pitch.md                       # Original hackathon pitch
```

### Module map

| Path | OpenSpec capability | Responsibility |
|------|---------------------|----------------|
| `pipeline/` | `dataset-ingestion` | Tatum RPC → Parquet |
| `apps/api/services/` + `contracts/seal_policy.move` | `walrus-seal-storage` | Seal V2 encrypt → Walrus → seal_approve decrypt |
| `contracts/` | `onchain-marketplace` | Registry + escrow on Sui |
| `apps/api/` | `marketplace-api` | Tatum proxy, orchestration |
| `apps/web/` | `marketplace-ui` | Browse · buy · verify UX |
| `packages/shared/` | `blob-verification` | Shared blob-ID logic + types |

### Development workflow

```text
1. /opsx:propose  →  proposal.md + design.md + specs/ + tasks.md
2. /opsx:apply    →  implement tasks.md checkboxes
3. /opsx:archive   →  merge specs into openspec/specs/ (source of truth)
```

Do **not** implement features outside the active OpenSpec change. Post-hackathon work gets its own change folder.

---

## 🏆 Hackathon Alignment

| Judging Criterion | Weight | How TaMind Delivers |
|-------------------|:------:|---------------------|
| **Walrus + Tatum Integration** | 30% | Walrus SDK + upload API in the core path; Tatum Sui RPC for registry reads and pipeline; live demo on Netlify with optional user Tatum API key. |
| **Technical Quality** | 30% | Modular monorepo, typed end-to-end, on-chain escrow, Walrus/Seal integration code complete (Seal off on mainnet demo). |
| **Creativity** | 20% | First *verifiable* AI dataset marketplace — combines decentralized storage, programmable access, and AI-ready packaging into one buyer-side primitive: **the blob ID**. |
| **Presentation** | 20% | This README, [live demo](https://tamind-hackathon-demo.netlify.app), [docs/DEMO.md](docs/DEMO.md), and a 2–3 min video (buy → verify → download). |

**Targeted bonus prizes:**

- 🌟 **Best Walrus Integration** — Walrus upload path + verify UI; mainnet blob pending network capacity (documented honestly).
- ⚡ **Best Use of Tatum Tools** — Sui RPC + Data API in pipeline and API; user-supplied Tatum key in production UI.

---

## 🗺️ Roadmap

### ✅ MVP — Hackathon (May 23 → Jun 6, 2026)

- [x] Sui Mainnet transactions dataset (rolling window)
- [x] Tatum Sui RPC integration (+ optional user API key in web UI)
- [x] Walrus SDK + upload API (`@mysten/walrus`)
- [ ] Walrus mainnet blob for live listing (placeholder ID in demo registry)
- [x] Seal V2 + `seal_approve` wired in Move/API/UI (`SEAL_ENABLED=false` on mainnet demo)
- [x] Sui Move `DatasetRegistry` + escrow contract (mainnet deployed)
- [x] React marketplace UI + verify + [Netlify demo](https://tamind-hackathon-demo.netlify.app)
- [x] TaMind MCP — list / search / verify datasets ([docs/MCP.md](docs/MCP.md))
- [ ] Demo video + hackathon form submit

> Track progress in [`openspec/changes/mvp-hackathon-sui-txs/tasks.md`](openspec/changes/mvp-hackathon-sui-txs/tasks.md)

### 🔜 Phase 2 — Post-Hackathon (Q3 2026)

- Multi-chain expansion: Ethereum, BSC, Bitcoin, Solana (via Tatum Data API)
- Dataset versioning (parent/child blob lineage on-chain)
- Real-time streaming datasets via Tatum WebSockets
- Advanced Seal policies: subscription, time-lock, allowlist
- Automated daily/hourly dataset publishing pipeline
- Royalty splits for dataset curators

### 🌐 Phase 3 — Mainnet Scale (Q4 2026+)

- All 130+ chains supported by Tatum
- Dataset DAO + community-curated listings
- AI agent marketplace (datasets + fine-tuned models, both on Walrus)
- Compliance-ready audit exports (blob ID + Sui tx as proof artifact)
- Native SDK for PyTorch / LangChain / HuggingFace

---

## 💼 Use Cases

> *MVP demonstrates Use Case 1. The rest are unlocked by the Phase 2/3 roadmap.*

1. **Quant funds & DeFi research** — backtest strategies on verified Sui tx history without rebuilding an RPC pipeline.
2. **Reproducible academic research** — cite a Walrus blob ID in a paper; reviewers re-download the identical dataset years later.
3. **AI agent training** — feed daily on-chain activity blobs directly into LangChain / RAG pipelines.
4. **Audit & compliance evidence** — present `blob ID + Sui tx` as a tamper-evident artifact in audit reports.
5. **Enterprise data brokers** — list proprietary blockchain intelligence behind a Seal policy; monetize without trust friction.

---

## 📊 Market Snapshot

| Segment | 2030 TAM | Notes |
|---------|---------:|-------|
| Global AI market | ~$1.8T | Source: Bloomberg Intelligence |
| Data marketplaces | ~$12.5B (2028) | Source: Grand View Research |
| Blockchain-AI intersection | ~$10.2B (2030) | Source: MarketsAndMarkets |

Direct comparables operating on closed, non-verifiable stacks today: **Chainalysis · Elliptic · TRM Labs · Messari · Dune · Nansen · Amberdata · CoinGecko**.
TaMind's wedge: **the same data, but verifiable by default.**

---

## 👤 Team

| | Name | Role |
|---|------|------|
| 🛠️ | **OlympusXVN** | Solo builder — full-stack, smart contracts, data pipeline, design |

> Hackathon team size: 1 (max allowed: 3). Open to collaborators post-hackathon — see [Discord](https://discord.gg/Ttp9zJwPqa).

---

## 🔗 References

- **OpenSpec** — [github.com/Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) · spec-driven workflow in `openspec/`
- **Agent skills** — [autoskills](https://github.com/midudev/autoskills) · [mattpocock/skills](https://github.com/mattpocock/skills) · [Karpathy CLAUDE.md](https://github.com/multica-ai/andrej-karpathy-skills)
- **Seal V2** — [seal-docs.wal.app](https://seal-docs.wal.app/) · [SDK](https://sdk.mystenlabs.com/seal)
- **Tatum** — [docs.tatum.io](https://docs.tatum.io) · [dashboard.tatum.io](https://dashboard.tatum.io) · [MCP server](https://github.com/tatumio/blockchain-mcp)
- **Walrus** — [walrus.xyz](https://walrus.xyz) · [docs.wal.app](https://docs.wal.app) · [Discord](https://discord.com/invite/walrusprotocol)
- **Sui** — [docs.sui.io](https://docs.sui.io) · [Sui Move book](https://move-book.com)
- **Hackathon page** — [tatum.io/tatum-x-walrus-hackathon](https://tatum.io/tatum-x-walrus-hackathon)
- **Submission form** — [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSdOkI-NlBkSHOudVcOXpeDN6h2TQf7f0m9JxA46mhx0Ifm77A/viewform)

---

## 📄 License

MIT — see [LICENSE](LICENSE).

---

<div align="center">

**Built for the Tatum × Build on Sui with Walrus Hackathon · May 2026**

🧠 *TaMind — Trust your data. Verify it. Train with confidence.*

</div>
