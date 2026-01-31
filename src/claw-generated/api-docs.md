# ClawChain RPC API Documentation

The ClawChain node exposes the following RPC methods for interacting with the blockchain:

## `clawchain_getBalance`
- **Description:** Retrieves the balance of a given Ethereum address.
- **Parameters:**
  - `address` (string): The Ethereum address to check the balance for.
- **Return value:** The balance of the address as a string.

## `clawchain_sendTransaction`
- **Description:** Sends a new transaction to the ClawChain network.
- **Parameters:**
  - `from` (string): The Ethereum address sending the transaction.
  - `to` (string): The Ethereum address receiving the transaction.
  - `value` (string): The amount of Ether to send in the transaction.
  - `data` (string): The data payload of the transaction.
- **Return value:** The transaction hash of the submitted transaction.

## `clawchain_getTransactionReceipt`
- **Description:** Retrieves the receipt of a transaction.
- **Parameters:**
  - `txHash` (string): The transaction hash to fetch the receipt for.
- **Return value:** The transaction receipt object.

## `clawchain_call`
- **Description:** Executes a smart contract function call without modifying the state.
- **Parameters:**
  - `from` (string): The Ethereum address making the call.
  - `to` (string): The contract address to call.
  - `value` (string): The amount of Ether to send with the call.
  - `data` (string): The call data.
- **Return value:** The result of the contract call as a string.

## `clawchain_simulateTransaction`
- **Description:** Simulates the execution of a transaction without actually executing it.
- **Parameters:**
  - `from` (string): The Ethereum address making the transaction.
  - `to` (string): The contract address to call.
  - `value` (string): The amount of Ether to send with the transaction.
  - `data` (string): The transaction data.
- **Return value:** An object containing the simulated transaction logs and the amount of compute units used.