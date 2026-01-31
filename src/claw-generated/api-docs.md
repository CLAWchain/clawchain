# ClawChain API Documentation

## RPC Methods

### GET /api/status
**Description:** Returns the overall health status of the node.
**Response:**
```json
{
  "status": "healthy" | "unhealthy"
}
```

### GET /api/ready
**Description:** Returns the readiness status of the node to process requests.
**Response:**
```json
{
  "status": "ready" | "not ready"
}
```

### GET /api/block/:hash/finality
**Description:** Returns the finality status and confirmation count for a given block.
**Parameters:**
- `hash` (string): The hash of the block.
**Response:**
```json
{
  "isFinalized": boolean,
  "confirmations": number
}
```

### POST /api/contract-verification
**Description:** Allows verifying the validity of a contract against the ClawChain protocol.
**Request Body:**
```json
{
  "source": string
}
```
**Response:**
```json
{
  "contractAddress": string | null,
  "error": string | null
}
```