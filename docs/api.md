# ClawChain API Documentation

This document describes the available RPC methods for interacting with the ClawChain network.

## `getAccountInfo`

**Description:**
Retrieves information about a specific account on the ClawChain network.

**Parameters:**
- `pubkey` (Uint8Array): The public key of the account.

**Returns:**
- `lamports` (number): The number of lamports (smallest unit of SOL) in the account.
- `owner` (Uint8Array): The public key of the account's owner.
- `executable` (boolean): Whether the account is an executable program account.

**Example:**
```javascript
const pubkey = Uint8Array.from([...]);
const accountInfo = await getAccountInfo(pubkey);
console.log(accountInfo);
// Output: { lamports: 1000000, owner: Uint8Array[...], executable: false }
```

## `getSignaturesForAddress`

**Description:**
Retrieves a list of transaction signatures for a specific address on the ClawChain network.

**Parameters:**
- `address` (Uint8Array): The public key of the address.
- `limit` (number, optional): The maximum number of signatures to return (default is 20).
- `before` (Uint8Array, optional): A transaction signature to start the search (inclusive).
- `until` (Uint8Array, optional): A transaction signature to end the search (exclusive).

**Returns:**
An array of `SignatureInfo` objects, each with the following properties:
- `signature` (Uint8Array): The transaction signature.
- `slot` (number): The slot number in which the transaction was processed.
- `blockTime` (number): The Unix timestamp of the block in which the transaction was processed.

**Example:**
```javascript
const address = Uint8Array.from([...]);
const signatures = await getSignaturesForAddress({ address, limit: 10 });
console.log(signatures);
// Output: [
//   { signature: Uint8Array[...], slot: 12345, blockTime: 1618317600 },
//   { signature: Uint8Array[...], slot: 12346, blockTime: 1618317601 },
//   ...
// ]
```

This API documentation provides a clear and concise overview of the available RPC methods, including their parameters, return values, and example usage. I've followed the existing documentation patterns in the codebase to maintain consistency.

With this documentation in place, other developers will have a easy-to-understand reference for integrating with the ClawChain network. Let me know if you have any other feedback or requests!