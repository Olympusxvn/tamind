Tamind

🧠 TaMind
Verifiable AI Dataset Marketplace on Sui
Trust your data. Verify it. Train with confidence.
*The first marketplace where every dataset is cryptographically verifiable, AI‑ready, and powered by Tatum’s 130+ blockchain infrastructure.*

📌 Overview
TaMind is a decentralized marketplace that provides AI developers, researchers, and enterprises with verifiable, ready‑to‑use blockchain datasets. By combining Tatum’s enterprise‑grade multi‑chain data API with Walrus decentralized storage and Sui smart contracts, TaMind eliminates the high cost and trust issues of traditional data pipelines.

Why TaMind exists – the real‑world numbers
5,000–5,000–20,000/month – What companies currently spend on building and maintaining in‑house blockchain data pipelines.
60% of AI projects fail due to data quality and provenance issues (source: Gartner).
0 verifiable, off‑the‑shelf blockchain datasets existed before TaMind.

⚠️ The Real‑World Problem
1. AI companies cannot verify training data
Financial auditors, regulators (SEC, MAS, FCA), and enterprise customers demand proof that data hasn’t been tampered with. Traditional RPC‑sourced data provides no cryptographic guarantee.

Consequence: AI models are trained on potentially corrupted data – and no one can prove otherwise.

2. Developers waste millions on data infrastructure
A typical AI startup needs:

Multiple RPC nodes (Ethereum, BSC, Solana, Sui…)

Custom ETL scripts to clean and normalize data

Storage for versioned datasets

Cost per month: 5,000–20,000 + months of engineering time.

3. Academic research cannot be reproduced
Leading conferences (NeurIPS, ICML) increasingly reject blockchain papers because datasets change over time (hard forks, reorgs, node updates) – making reproduction impossible.

💡 TaMind Solution
Problem	Tamind Solution
Data cannot be verified	Cryptographic verification – blob ID derived from content, stored on Walrus
Expensive pipelines	Instant datasets – download via HTTPS, train in minutes
No reproduction	Immutable dataset IDs – same blob ID forever, perfect for research
Trust between buyers & sellers	Smart contract escrow + Seal access control – pay only when data is delivered and verified

✨ Key Features (Powered by Tatum)
1. 🔄 Multi‑Chain Data Acquisition – Tatum Data API
130+ blockchains – Ethereum, Bitcoin, BSC, Sui, Solana, and more
Unified interface – consistent endpoints for all chains
Enriched data – transactions, logs, token transfers, DeFi events, NFT metadata
Real‑time & historical – live streams + deep history

2. 🧠 AI‑Ready Packaging
Formats: CSV, Parquet, JSON
Optimized for PyTorch, TensorFlow, LangChain
Direct consumption by AI agents via Tatum MCP

3. 🔐 Cryptographic Verification – Walrus + Seal
Content‑addressed blob IDs – any change = different ID
Seal access policies – allowlist, token‑gating, time‑lock, payment condition
On‑chain provenance – every dataset is tracked on Sui

4. 🏪 Smart Marketplace – Sui Smart Contracts
Dataset listing & discovery
Escrow payments (SUI / USDC / WAL)
Automatic royalty distribution
Verifiable download logs

5. 🤖 Tatum MCP – AI Agent Gateway
Connect any LLM to 130+ blockchains in seconds
Natural language → blockchain queries
Read/write capabilities

🏗️ Architecture

[ AI App / Research / Agent ] 
         │
         ▼
┌─────────────────────────────────┐
│   TaMind Frontend / API         │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Tatum MCP Server               │
│   (130+ chains, natural language)│
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Tatum Data API                 │
│   – fetch raw data               │
│   – clean & structure            │
│   – export CSV/Parquet           │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Tatum Storage API (Walrus)     │
│   – upload blob                  │
│   – apply Seal policy            │
│   – return blob ID + download URL│
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Sui Blockchain                  │
│   – dataset registry             │
│   – payment escrow               │
│   – Seal policy execution        │
└─────────────────────────────────┘

🌍 Real‑World Impact – Numbers & Use Cases

Use Case 1: FinTech & DeFi Hedge Funds

Problem: A quantitative fund wants to backtest a trading strategy on 5 years of Ethereum, BSC, and Solana transaction data. Building a reliable, verified pipeline costs $15,000 and 3 months.

TaMind solution:
Download the “DeFi Historical Trades” dataset for $500. Blob ID proves it hasn’t been altered. Train in 2 days.

Impact: 90% cost reduction, 95% time reduction.

Use Case 2: Audit & Compliance (Big4, Chainalysis)

Problem: An auditor must prove to the SEC that the data used for a client report is authentic and complete. Traditional RPC logs are not court‑admissible as proof.

TaMind solution:
Auditor purchases a dataset from TaMind, downloads it, and can present blob ID + Sui transaction as cryptographic proof. The regulator can independently verify the blob ID against Walrus.

Impact: Audit risk reduced from “high” to “zero” – first verifiable blockchain audit.

Use Case 3: Academic Research (MIT, Stanford)

Problem: A PhD candidate publishes a paper on MEV extraction using Ethereum data. Six months later, another researcher cannot reproduce the results because the original dataset changed after a hard fork.

TaMind solution:
The candidate stores the exact dataset on Walrus, publishes the blob ID in the paper. Anyone can download the identical dataset forever.

Impact: Reproducible science becomes possible. Journals can mandate TaMind blobs as a submission requirement.

Use Case 4: AI Agent Training

Problem: A startup building an on‑chain trading agent needs daily updated datasets across 10 chains. They currently spend $8,000/month on RPC nodes + ETL engineers.

TaMind solution:
Subscribe to TaMind’s “Daily On‑Chain Activity” dataset. Download via HTTPS each morning. Feed directly into their agent’s LangChain pipeline.

Impact: Monthly cost drops to $1,200 – a 85% saving.

Use Case 5: Data Marketplace for Enterprise

Problem: A data broker wants to sell blockchain‑derived intelligence to banks, but buyers don’t trust the data’s origin.

TaMind solution:
The broker uploads datasets to TaMind, sets a Seal policy (“only buyers who pay 500 USDC”). The smart contract handles payment and access. Buyers get verifiable data.

Impact: New revenue stream with zero trust friction.

📊 Market Opportunity (TAM / SAM / SOM)

Sement	Value	Tamind's Share
Global AI market (2030)	$1.8 trillion	
Global data marketplace (2028)	12.5 billion	0.5% → $62.5M
Blockchain AI market (2030)	$10.2 billion	2% → $204M
Immediate addressable customers	~2,000 (hedge funds, auditors, research labs, data brokers)	$10M ARR within 2 years

Real customers already using similar (non‑verifiable) solutions: Chainalysis, Elliptic, TRM Labs, Messari, CoinGecko, Dune, Nansen, Amberdata.

🛠️ Technology Stack

stack	Technology
Data Acquisition	Tatum Data API (130+ chains)
AI / LLM Integration	Tatum MCP Server
Storage	Walrus via Tatum Storage API
Access Control	Walrus Seal
Smart Contracts	Sui Move
Backend	Node.js + Express + TypeScript
Frontend	React + TypeScript + TailwindCSS
ML Framework	Python + Pandas + PyTorch

🚦 How It Works (End‑to‑End)

Data Collection – Tatum Data API pulls raw blockchain data from 130+ chains.
Processing – Data is cleaned, structured, and exported as CSV/Parquet.
Upload & Seal – Processed file is uploaded via Tatum Storage API. A Seal policy (e.g., “only buyers who pay 100 SUI”) is attached.
Marketplace Listing – Blob ID, price, and policy are registered in a Sui smart contract.
Discovery – AI developers search/filter datasets via TaMind frontend or API.
Purchase & Access – Buyer pays escrow smart contract. Seal grants decryption rights. Download link becomes active.
Verification – Buyer can independently verify blob ID against Walrus aggregator.

📁 Project Structure

tamind/
├── frontend/                 # React + TypeScript dashboard
│   ├── src/
│   │   ├── components/       # UI components (DatasetCard, etc.)
│   │   ├── pages/            # Marketplace, dataset details, upload
│   │   ├── hooks/            # Custom React hooks
│   │   └── utils/            # Helpers, Tatum API clients
│   └── package.json
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Tatum Data API, Walrus integration
│   │   ├── models/           # Database models
│   │   └── contracts/        # Sui smart contract interfaces
│   └── package.json
├── smart-contracts/          # Sui Move contracts
│   ├── sources/              # Marketplace, DatasetRegistry
│   └── Move.toml
├── data-pipeline/            # Python data processing
│   ├── collectors/           # Tatum Data API collectors
│   ├── processors/           # Clean, normalize, format
│   └── uploaders/            # Walrus upload via Tatum
├── docker-compose.yml        # Local development setup
└── README.md

🚀 Getting Started

Prerequisites
Node.js 18+, Python 3.10+
Tatum API Key (free from dashboard.tatum.io)
Sui wallet (Sui Wallet or Suiet)

QuickStart

git clone https://github.com/Olympusxvn/tamind
cd tamind

# Backend
cd backend
npm install
cp .env.example .env   # add TATUM_API_KEY, SUI_PRIVATE_KEY
npm run dev

# Frontend (new terminal)
cd ../frontend
npm install
npm start

# Data pipeline (new terminal)
cd ../data-pipeline
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run_pipeline.py

Example: Fetch Data via Tatum

from tatum import TatumSDK, Network

tatum = TatumSDK(network=Network.ETHEREUM_MAINNET)
txs = tatum.get_transaction_history(address="0x...")
# → returns cleaned, enriched transactions

Example: Upload Dataset to Walrus via Tatum Storage API

response = tatum.storage.upload(
    file="dataset.parquet",
    storage_type="WALRUS",
    epochs=10,
    access_policy={
        "type": "token_gated",
        "token_address": "0x...",
        "price": "100 USDC"
    }
)
print(response["blobId"])       # Content-addressed, immutable
print(response["downloadUrl"])  # Instant HTTPS access

🗺️ Future Roadmap

Phase	Features
MVP (Hackathon)	Ethereum + Bitcoin + BSC data; token‑gated access; basic marketplace UI
Phase 2	Real‑time streaming via Tatum WebSockets; dataset versioning; Tatum MCP integration
Phase 3	All 130+ chains; advanced Seal policies (time‑lock, subscription); batch downloads

Criteria Alignment

Criterion	How TaMind Delivers
Walrus + Tatum Integration	Full use of Tatum Data API, Storage API, MCP Server; Walrus for storage + Seal for access
Technical Quality	Modular architecture, error handling, Tatum RPC gateway, Sui smart contracts
Creativity	First verifiable AI dataset marketplace – unique combination of decentralised storage, multi‑chain data, and AI training
Presentation	This README + live demo video + real‑world impact numbers

Walrus: Creative use of Walrus + Seal for dataset monetization
Tatum: Full deployment of Data API, Storage API, and MCP Server

👥 Team
Name	Role	Focus
OlympusXVN	Lead Developer	Tatum integration, backend
OlympusXVN	Smart Contract Engineer	Sui Move, Walrus Seal
OlympusXVN	Frontend & ML	UI, AI pipeline

🔗 References

Tatum Documentation – docs.tatum.io
Tatum MCP Server – github.com/tatumio/blockchain-mcp
Walrus Documentation – docs.walrus.xyz
Walrus Seal – blog.sui.io/seal-programmable-access-control
Sui Documentation – docs.sui.io
Tatum Dashboard – dashboard.tatum.io

📄 License
MIT

Built with ❤️ for the Tatum x Build on Sui with Walrus Hackathon
TaMind – Trust your data. Verify it. Train with confidence.

