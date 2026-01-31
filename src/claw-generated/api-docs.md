# ClawChain API Documentation

## RPC Methods

### `get_transaction`
**Description:** Retrieves a transaction by its signature.

**Parameters:**
- `signature: string` - The signature of the transaction to retrieve.

**Returns:**
- `transaction: Transaction | null` - The transaction object, or `null` if not found.

**Example:**
```typescript
const signature = "0x123abc...";
const transaction = await rpc.getTransaction(signature);
if (transaction) {
  console.log(transaction.to, transaction.value);
} else {
  console.log("Transaction not found");
}
```

### `get_signatures_for_address`
**Description:** Retrieves a list of transaction signatures for a given address.

**Parameters:**
- `address: string` - The address to retrieve signatures for.
- `limit?: number` - The maximum number of signatures to return (default: 10).
- `offset?: number` - The offset to start returning signatures from (default: 0).

**Returns:**
- `signatures: string[]` - An array of transaction signatures.

**Example:**
```typescript
const address = "0x456def...";
const signatures = await rpc.getSignaturesForAddress(address, 20, 0);
console.log(signatures);
```