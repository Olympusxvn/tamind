## ADDED Requirements

### Requirement: Seal V2 client-side encryption

The system SHALL encrypt dataset files using Seal V2 (`@mysten/seal`) **before** uploading to Walrus.

#### Scenario: Encrypt Parquet with threshold encryption

- **WHEN** a seller uploads a `.parquet` dataset for listing
- **THEN** the API calls `client.seal.encrypt` with a configured threshold, `packageId`, and policy `id`
- **AND** only the resulting `encryptedObject` bytes are uploaded to Walrus
- **AND** the symmetric backup key is NOT stored on Walrus (optional local backup only)

#### Scenario: Encryption requires deployed seal_approve package

- **WHEN** `PACKAGE_ID` for the Seal policy module is not configured
- **THEN** upload is rejected with a clear configuration error

### Requirement: Walrus stores ciphertext only

The system SHALL upload Seal-encrypted bytes to Walrus and obtain a content-addressed blob ID for the ciphertext.

#### Scenario: Upload encrypted blob

- **WHEN** Seal V2 encryption completes successfully
- **THEN** ciphertext is written to Walrus as a non-deletable blob
- **AND** the system returns blob ID and Walrus aggregator URL for the encrypted object

#### Scenario: Upload failure

- **WHEN** Walrus upload fails due to network or quota error
- **THEN** the system returns an error without registering the dataset on-chain

### Requirement: seal_approve payment gate

Access control SHALL be enforced via a Move `seal_approve*` function that validates on-chain purchase before key release.

#### Scenario: Approve after escrow purchase

- **WHEN** a buyer requests decryption after a confirmed `PurchaseEvent` for the dataset
- **THEN** a PTB calls `seal_approve` with the dataset policy `id` and purchase proof
- **AND** Seal key servers return threshold key shares
- **AND** `client.seal.decrypt` returns the original Parquet plaintext

#### Scenario: Approve denied without purchase

- **WHEN** a user without a valid purchase attempts decryption
- **THEN** `seal_approve` aborts
- **AND** decryption fails with an access-denied error

### Requirement: SessionKey for buyer decryption

The web app SHALL use Seal `SessionKey` with wallet-signed personal message for time-limited decryption access.

#### Scenario: Buyer decrypt flow

- **WHEN** a buyer with a confirmed purchase initiates download
- **THEN** the frontend creates a `SessionKey`, prompts wallet signature, and passes `txBytes` (seal_approve PTB) to `client.seal.decrypt`
- **AND** the decrypted `.parquet` is saved locally

#### Scenario: Public aggregator shows ciphertext

- **WHEN** an unauthenticated user fetches the blob from the Walrus aggregator
- **THEN** they receive encrypted bytes that cannot be parsed as valid Parquet without Seal decryption
