## ADDED Requirements

### Requirement: Blob ID recomputation

The shared library SHALL provide a deterministic function to compute a Walrus blob ID from raw bytes.

#### Scenario: Matching blob ID

- **WHEN** `computeWalrusBlobId(bytes)` is called with the original uploaded bytes
- **THEN** the returned ID equals the blob ID stored in the on-chain registry

#### Scenario: Tampered bytes

- **WHEN** `computeWalrusBlobId(bytes)` is called with modified bytes
- **THEN** the returned ID differs from the on-chain registry blob ID

### Requirement: Independent aggregator fetch

Verification SHALL fetch blob bytes directly from a public Walrus aggregator, not from the TaMind backend.

#### Scenario: Direct aggregator verification

- **WHEN** verification is triggered in the web app
- **THEN** blob bytes are fetched from `https://aggregator.walrus.space/v1/{blobId}` (or configured aggregator)
- **AND** no TaMind API endpoint serves the blob content used for verification

### Requirement: Verification result display

The system SHALL surface verification outcome with on-chain reference for auditability.

#### Scenario: Audit trail shown

- **WHEN** verification completes successfully
- **THEN** the UI displays blob ID, on-chain registry tx digest, and Walrus aggregator URL
- **AND** the user can independently re-run verification outside TaMind
