## ADDED Requirements

### Requirement: Marketplace browse page

The web app SHALL display all registered datasets from the on-chain registry.

#### Scenario: Dataset grid loads

- **WHEN** a user navigates to the marketplace home page
- **THEN** a grid of dataset cards is shown with title, price, blob ID (truncated), and seller address

#### Scenario: Empty marketplace

- **WHEN** no datasets are registered on-chain
- **THEN** the UI displays an empty state with instructions to publish a dataset

### Requirement: Dataset detail and purchase

The web app SHALL allow a connected wallet to purchase a dataset.

#### Scenario: Buy flow

- **WHEN** a user with a connected Sui wallet clicks "Buy" on a dataset
- **THEN** the wallet prompts to sign the escrow transaction
- **AND** upon confirmation, the UI shows purchase success and enables download

#### Scenario: Wallet not connected

- **WHEN** a user clicks "Buy" without a connected wallet
- **THEN** the UI prompts the user to connect a Sui wallet

### Requirement: Decrypt and download

The web app SHALL decrypt and download the dataset after a verified purchase.

#### Scenario: Post-purchase download

- **WHEN** a buyer has a confirmed on-chain purchase
- **THEN** the UI requests Seal decryption key release
- **AND** the decrypted `.parquet` file is downloaded to the user's device

### Requirement: Verify on Walrus button

The web app SHALL provide an independent blob verification action visible on the dataset detail page.

#### Scenario: Verification succeeds

- **WHEN** a user clicks "Verify on Walrus" after downloading
- **THEN** the app fetches blob bytes from the Walrus aggregator
- **AND** recomputes the blob ID using the shared helper
- **AND** displays ✅ if it matches the on-chain registry blob ID

#### Scenario: Verification fails (tampered data)

- **WHEN** recomputed blob ID does not match the on-chain value
- **THEN** the UI displays ❌ with message "Dataset may have been tampered with"
