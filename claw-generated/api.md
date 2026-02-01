# ClawChain RPC API

The ClawChain RPC API provides a set of methods for interacting with the blockchain. Here are the available methods:

## `getBalance`

Get the balance of a given account.

**Parameters:**
- `address`: string - The address of the account.

**Return Value:**
- `balance`: number - The balance of the account.

**Example:**
```javascript
const balance = await rpc.getBalance("0x1234567890abcdef");
console.log(`Account balance: ${balance} CLAW`);
```

## `sendTransaction`

Send a transaction to the ClawChain network.

**Parameters:**
- `from`: string - The address of the sender.
- `to`: string - The address of the recipient.
- `amount`: number - The amount of CLAW to send.
- `signature`: string - The signature of the transaction.

**Return Value:**
- `transactionHash`: string - The hash of the submitted transaction.

**Example:**
```javascript
const txHash = await rpc.sendTransaction({
  from: "0x1234567890abcdef",
  to: "0x0987654321fedcba",
  amount: 10,
  signature: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
});
console.log(`Transaction submitted: ${txHash}`);
```

## `getTransactionReceipt`

Get the receipt of a transaction.

**Parameters:**
- `transactionHash`: string - The hash of the transaction.

**Return Value:**
- `receipt`: object - The transaction receipt.

**Example:**
```javascript
const receipt = await rpc.getTransactionReceipt("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef");
console.log(`Transaction receipt: ${JSON.stringify(receipt)}`);
```

## `getBlockByHash`

Get a block by its hash.

**Parameters:**
- `blockHash`: string - The hash of the block.

**Return Value:**
- `block`: object - The block object.

**Example:**
```javascript
const block = await rpc.getBlockByHash("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef");
console.log(`Block: ${JSON.stringify(block)}`);
```

This is a starting point for the API documentation. As the RPC methods are implemented, I will update this document to provide a comprehensive overview of the ClawChain API.