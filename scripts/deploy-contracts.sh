#!/usr/bin/env bash
# Deploy TaMind Move package to Sui (requires sui CLI + funded wallet)
set -euo pipefail
cd "$(dirname "$0")/../contracts"
sui move build
sui client publish --gas-budget 100000000
echo "Copy PackageID and shared DatasetRegistry object ID to apps/api/.env"
