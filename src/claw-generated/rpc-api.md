# ClawChain RPC API Documentation

The ClawChain RPC API provides a set of methods for interacting with the ClawChain network. These methods allow developers to create and manage accounts, send transactions, query the blockchain state, and more.

## RPC Methods

### `createAccount`
Creates a new account on the ClawChain network.

**Parameters:**
- `name` (string): The name of the new account.
- `initialBalance` (number): The initial balance to be deposited into the new account.

**Return Value:**
- `accountId` (string): The unique identifier of the newly created account.

**Example:**
```javascript
const response = await rpc.createAccount({
  name: "myaccount",
  initialBalance: 1000
});
console.log(response.accountId); // "0x123abc..."
```

### `sendTransaction`
Sends a transaction from one account to another.

**Parameters:**
- `from` (string): The account ID of the sender.
- `to` (string): The account ID of the recipient.
- `amount` (number): The amount of tokens to be transferred.

**Return Value:**
- `transactionId` (string): The unique identifier of the submitted transaction.

**Example:**
```javascript
const response = await rpc.sendTransaction({
  from: "0x123abc...",
  to: "0x456def...",
  amount: 100
});
console.log(response.transactionId); // "0x789ghi..."
```

### `getAccountBalance`
Retrieves the current balance of a given account.

**Parameters:**
- `accountId` (string): The ID of the account to query.

**Return Value:**
- `balance` (number): The current balance of the account.

**Example:**
```javascript
const response = await rpc.getAccountBalance({
  accountId: "0x123abc..."
});
console.log(response.balance); // 1000
```

### `getTransactionStatus`
Retrieves the current status of a given transaction.

**Parameters:**
- `transactionId` (string): The ID of the transaction to query.

**Return Value:**
- `status` (string): The current status of the transaction ("pending", "confirmed", "failed").

**Example:**
```javascript
const response = await rpc.getTransactionStatus({
  transactionId: "0x789ghi..."
});
console.log(response.status); // "confirmed"
```

### `getBlockInfo`
Retrieves information about a specific block in the blockchain.

**Parameters:**
- `blockNumber` (number): The number of the block to query.

**Return Value:**
- `blockHash` (string): The unique identifier of the block.
- `timestamp` (number): The timestamp of the block.
- `transactions` (array): A list of transaction IDs included in the block.

**Example:**
```javascript
const response = await rpc.getBlockInfo({
  blockNumber: 12345
});
console.log(response.blockHash); // "0xabc123..."
console.log(response.timestamp); // 1618307200
console.log(response.transactions); // ["0x456def...", "0x789ghi..."]
```

### `getChainStats`
Retrieves high-level statistics about the ClawChain network.

**Parameters:**
- (none)

**Return Value:**
- `totalAccounts` (number): The total number of accounts on the network.
- `totalTransactions` (number): The total number of transactions processed.
- `blockHeight` (number): The current height of the blockchain.

**Example:**
```javascript
const response = await rpc.getChainStats();
console.log(response.totalAccounts); // 10000
console.log(response.totalTransactions); // 100000
console.log(response.blockHeight); // 54321
```

This covers the full set of RPC methods planned for the initial release of the ClawChain network. As the project evolves, additional methods may be added to the API. Please refer to the latest documentation for the most up-to-date information.