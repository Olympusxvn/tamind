## ADDED Requirements

### Requirement: Tatum RPC proxy

The API SHALL proxy Sui RPC calls through Tatum with the API key injected server-side.

#### Scenario: Authenticated RPC proxy

- **WHEN** the frontend requests on-chain data via `/api/sui/*`
- **THEN** the API forwards the request to `https://sui-mainnet.gateway.tatum.io` with the `x-api-key` header
- **AND** the Tatum API key is never included in the response or exposed to the browser

### Requirement: Dataset listing endpoint

The API SHALL expose registered datasets aggregated from the on-chain registry.

#### Scenario: GET /api/datasets

- **WHEN** a client sends `GET /api/datasets`
- **THEN** the API returns a JSON array of datasets with blob ID, price, seller, Seal policy ID, and metadata

### Requirement: Upload orchestration endpoint

The API SHALL orchestrate Seal V2 encryption, Walrus ciphertext upload, and on-chain registration.

#### Scenario: POST /api/datasets/upload

- **WHEN** an authenticated seller submits a Parquet file with price
- **THEN** the API encrypts via `client.seal.encrypt`, uploads ciphertext to Walrus, registers on-chain, and returns blob ID + dataset ID + seal policy identity

### Requirement: Purchase orchestration endpoint

The API SHALL build and return a purchase transaction payload for the buyer's wallet to sign.

#### Scenario: POST /api/datasets/:id/purchase

- **WHEN** a buyer requests purchase for a valid dataset ID
- **THEN** the API returns a serialized Sui transaction for `purchase_dataset`
- **AND** after on-chain confirmation, the API returns Seal V2 decrypt params (`SessionKey` + `seal_approve` tx template)

### Requirement: Verification endpoint

The API SHALL provide blob metadata for client-side verification.

#### Scenario: GET /api/datasets/:id/verify

- **WHEN** a client requests verification metadata for a dataset
- **THEN** the API returns the on-chain blob ID, Walrus aggregator URL, and registry transaction digest
