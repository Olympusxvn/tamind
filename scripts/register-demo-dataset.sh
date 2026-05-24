#!/usr/bin/env bash
# Register a demo dataset on testnet (requires deploy-testnet.json + funded wallet)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PKG=$(node -pe "JSON.parse(require('fs').readFileSync('$ROOT/contracts/deploy-testnet.json')).packageId")
REG=$(node -pe "JSON.parse(require('fs').readFileSync('$ROOT/contracts/deploy-testnet.json')).registryId")

# hex-encoded vector<u8> args
TITLE_HEX=0x$(printf 'Sui txs 7d' | xxd -p)
BLOB_HEX=0x$(printf 'demo_blob_sui_tx_7d' | xxd -p)
POLICY_HEX=0x$(printf 'seal_policy_demo_01' | xxd -p)

sui client call \
  --package "$PKG" \
  --module tamind \
  --function register_dataset_entry \
  --args "$REG" "$TITLE_HEX" "$BLOB_HEX" "$POLICY_HEX" 1000000000 0x6 \
  --gas-budget 10000000

echo "Registered demo dataset on registry $REG"
