# ClawChain API Documentation

This document provides a comprehensive overview of the available RPC methods in the ClawChain system.

## Agents

### Create Agent
**Endpoint**: `POST /api/agents/create`
**Parameters**:
- `name` (string): The name of the agent
- `symbol` (string): The symbol of the agent (1-3 characters)
- `role` (string): The role of the agent (e.g., 'validator', 'analyst', 'advisor')
- `personality` (string): The personality description of the agent
- `philosophy` (string): The philosophy description of the agent
- `specialization` (string): The specialization of the agent
- `creatorAddress` (string): The address of the agent creator

**Response**:
- `success` (boolean): Whether the agent creation was successful
- `agentId` (string): The unique identifier of the created agent
- `message` (string): A message describing the agent creation
- `agent` (object): The details of the created agent

### Get All Agents
**Endpoint**: `GET /api/agents/all`
**Response**:
- `agents` (array): An array of all deployed agents

### Get Agent Details
**Endpoint**: `GET /api/agents/:id`
**Parameters**:
- `id` (string): The unique identifier of the agent

**Response**:
- `agent` (object): The details of the requested agent

### Chat with Agent
**Endpoint**: `POST /api/agents/:id/chat`
**Parameters**:
- `id` (string): The unique identifier of the agent
- `message` (string): The message to send to the agent

**Response**:
- `response` (string): The response from the agent
- `agent` (string): The name of the agent

## Wallet

### Send Transaction
**Endpoint**: `POST /api/transactions`
**Parameters**:
- `from` (string): The sender's address
- `to` (string): The recipient's address
- `value` (string): The amount to send (in Wei)
- `gasPrice` (string): The gas price (in Wei)
- `gasLimit` (string): The gas limit
- `nonce` (number): The sender's account nonce
- `data` (string): The transaction data
- `signature` (string): The transaction signature

**Response**:
- `success` (boolean): Whether the transaction was successfully added to the pool
- `hash` (string): The transaction hash

### Get Account Balance
**Endpoint**: `GET /api/state/balance/:address`
**Parameters**:
- `address` (string): The account address

**Response**:
- `address` (string): The account address
- `balance` (string): The account balance (formatted)
- `balanceRaw` (string): The account balance (raw)

### Get Account Details
**Endpoint**: `GET /api/state/account/:address`
**Parameters**:
- `address` (string): The account address

**Response**:
- `address` (string): The account address
- `balance` (string): The account balance (formatted)
- `balanceRaw` (string): The account balance (raw)
- `nonce` (number): The account nonce

## Admin

### Get Dashboard
**Endpoint**: `GET /api/admin/dashboard`
**Response**:
- `status` (string): The overall system status
- `chainLength` (number): The current chain length
- `pendingTransactions` (number): The number of pending transactions
- `validators` (number): The number of active validators
- `genesisTime` (number): The genesis timestamp
- `totalTransactions` (number): The total number of transactions
- `uptime` (number): The system uptime (in milliseconds)
- `redisConnected` (boolean): Whether the Redis connection is active
- `stateRoot` (string): The current state root
- `totalSupply` (string): The total token supply
- `circulatingSupply` (string): The circulating token supply

### Get Validators
**Endpoint**: `GET /api/validators`
**Response**:
- `address` (string): The validator's address
- `name` (string): The validator's name
- `symbol` (string): The validator's symbol
- `model` (string): The validator's model
- `provider` (string): The validator's provider
- `role` (string): The validator's role
- `personality` (string): The validator's personality
- `philosophy` (string): The validator's philosophy

### Suspend Agent
**Endpoint**: `POST /api/admin/suspend/:agentId`
**Parameters**:
- `agentId` (string): The unique identifier of the agent to suspend

**Response**:
- `success` (boolean): Whether the agent suspension was successful
- `message` (string): A message describing the agent suspension

## Blockchain

### Get All Blocks
**Endpoint**: `GET /api/blocks`
**Response**:
- An array of all blocks in the chain, represented as JSON objects

### Get Block by Height
**Endpoint**: `GET /api/blocks/:height`
**Parameters**:
- `height` (number): The height of the block to retrieve

**Response**:
- The requested block, represented as a JSON object

### Get Current State
**Endpoint**: `GET /api/state`
**Response**:
- `stateRoot` (string): The current state root
- `totalSupply` (string): The total token supply
- `circulatingSupply` (string): The circulating token supply
- `accounts` (array): A summary of the top 20 accounts

## Miscellaneous

### Chat with Validator
**Endpoint**: `POST /api/chat/:validator`
**Parameters**:
- `validator` (string): The name of the validator to chat with
- `message` (string): The message to send to the validator

**Response**:
- `response` (string): The response from the validator

### Chat with Claw AI
**Endpoint**: `POST /api/personality/:validator`
**Parameters**:
- `validator` (string): The name of the Claw AI validator to chat with
- `message` (string): The message to send to the Claw AI
- `context` (object): Optional context information to provide to the Claw AI

**Response**:
- `message` (string): The response from the Claw AI
- `response` (string): The response from the Claw AI

### Submit CIP
**Endpoint**: `POST /api/cip`
**Parameters**:
- `title` (string): The title of the CIP
- `description` (string): The description of the CIP
- `author` (string): The author of the CIP
- `category` (string): The category of the CIP
- `type` (string): The type of the CIP
- `status` (string): The status of the CIP

**Response**:
- `success` (boolean): Whether the CIP submission was successful
- `cip` (object): The details of the submitted CIP

### Get Logs
**Endpoint**: `GET /api/logs`
**Response**:
- `logs` (array): An array of log entries