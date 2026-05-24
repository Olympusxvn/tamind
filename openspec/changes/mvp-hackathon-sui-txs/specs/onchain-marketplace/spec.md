## ADDED Requirements

### Requirement: Dataset registration on-chain

The Move contract SHALL allow a seller to register a dataset with blob ID, price, and Seal policy reference.

#### Scenario: Register new dataset

- **WHEN** a seller calls `register_dataset` with valid blob ID, price in MIST, and Seal policy ID
- **THEN** a new dataset entry is added to the shared `DatasetRegistry` object
- **AND** a `DatasetRegistered` event is emitted with all metadata fields

#### Scenario: Duplicate blob ID rejected

- **WHEN** a seller attempts to register a blob ID already present in the registry
- **THEN** the transaction aborts with a duplicate error

### Requirement: Escrow purchase flow

The Move contract SHALL hold buyer payment in escrow and emit a purchase event for Seal verification.

#### Scenario: Successful purchase

- **WHEN** a buyer calls `purchase_dataset` with sufficient SUI for the listed price
- **THEN** the payment is transferred to escrow (or seller per design)
- **AND** a `PurchaseEvent` is emitted containing buyer address, dataset ID, and blob ID
- **AND** the buyer is recorded as an authorized purchaser

#### Scenario: Insufficient payment

- **WHEN** a buyer sends less SUI than the listed price
- **THEN** the transaction aborts without modifying registry state

### Requirement: On-chain dataset discovery

The registry SHALL expose all active dataset listings for off-chain indexers and the frontend.

#### Scenario: List datasets

- **WHEN** a client queries the `DatasetRegistry` shared object
- **THEN** all registered datasets are returned with blob ID, price, seller, Seal policy ID, and registration timestamp
