## ADDED Requirements

### Requirement: Sui transaction collection via Tatum RPC

The pipeline SHALL fetch Sui Mainnet transaction blocks using Tatum Sui RPC as the sole data source.

#### Scenario: Collect rolling window

- **WHEN** the operator runs `run_pipeline.py --chain sui --window 7d`
- **THEN** the pipeline queries transaction blocks from the last 7 days via Tatum Sui RPC
- **AND** raw results are persisted locally before processing

#### Scenario: Pagination for large windows

- **WHEN** the transaction count exceeds a single RPC page
- **THEN** the pipeline paginates until the full window is collected or a configured cap is reached

### Requirement: AI-ready Parquet export

The pipeline SHALL normalize collected transactions into a Parquet file suitable for ML training.

#### Scenario: Successful export

- **WHEN** raw transaction data has been collected
- **THEN** the pipeline writes a `.parquet` file with normalized columns (digest, sender, timestamp, gas, status, effects summary)
- **AND** the output file path is printed to stdout

#### Scenario: Empty collection

- **WHEN** no transactions are returned for the given window
- **THEN** the pipeline exits with a non-zero code and a clear error message
