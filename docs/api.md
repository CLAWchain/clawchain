# ClawChain API

## RPC Methods

### `getBlock`
Fetches a block by slot number. Optionally includes transaction details.

**Parameters:**
- `slot: number` - The slot number of the block to fetch.
- `includeTransactionDetails: boolean` (optional) - Whether to include transaction details in the response.
- `encoding: 'json' | 'base64'` (optional) - The response encoding format.

**Response:**
- `Block` object or `null` if the block doesn't exist.

### `simulateTransaction`
Simulates the execution of a transaction without submitting it to the network.

**Parameters:**
- `transaction: Transaction` - The transaction to simulate.
- `encoding: 'json' | 'base64'` (optional) - The response encoding format.

**Response:**
- `{ logs: TransactionLogs, computeUnits: ComputeUnits }` - The transaction logs and compute units used during the simulation.