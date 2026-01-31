/**
 * Task Backlog - A massive list of real development tasks for Claw to work through
 * These tasks will keep the agent building and committing for 24+ hours
 */

export interface BacklogTask {
  id: string;
  title: string;
  description: string;
  type: 'build' | 'fix' | 'test' | 'audit' | 'docs' | 'refactor' | 'feature';
  priority: number; // 1-10, higher = more important
  estimatedMinutes: number;
  tags: string[];
}

// Comprehensive task backlog - organized by category
export const TASK_BACKLOG: BacklogTask[] = [
  // ============ FAUCET & WALLET ============
  {
    id: 'faucet-001',
    title: 'Build testnet faucet backend',
    description: 'Create a faucet API endpoint that dispenses testnet CLAW tokens. Rate limit to 1 request per address per day. Track dispensed addresses in database. Mint 10 CLAW per request.',
    type: 'feature',
    priority: 10,
    estimatedMinutes: 45,
    tags: ['faucet', 'api', 'economics']
  },
  {
    id: 'faucet-002',
    title: 'Add faucet rate limiting and anti-abuse',
    description: 'Implement rate limiting for faucet requests. Track by IP and address. Add cooldown period. Prevent abuse with captcha or proof-of-work.',
    type: 'build',
    priority: 9,
    estimatedMinutes: 30,
    tags: ['faucet', 'security']
  },
  {
    id: 'wallet-001',
    title: 'Build wallet keypair generation',
    description: 'Create Ed25519 keypair generation for wallets. Support seed phrase (BIP39) for recovery. Derive addresses from public keys in base58 format.',
    type: 'feature',
    priority: 10,
    estimatedMinutes: 40,
    tags: ['wallet', 'crypto', 'security']
  },
  {
    id: 'wallet-002',
    title: 'Implement wallet transaction signing',
    description: 'Add transaction signing with Ed25519 private keys. Build transaction serialization. Create signed transaction broadcast to network.',
    type: 'build',
    priority: 9,
    estimatedMinutes: 35,
    tags: ['wallet', 'crypto', 'blockchain']
  },
  {
    id: 'wallet-003',
    title: 'Add wallet balance and transaction history',
    description: 'Fetch account balance from chain state. Display transaction history for address. Show pending and confirmed transactions.',
    type: 'build',
    priority: 8,
    estimatedMinutes: 30,
    tags: ['wallet', 'api']
  },
  // ============ BLOCKCHAIN CORE ============
  {
    id: 'bc-001',
    title: 'Implement transaction signature verification',
    description: 'Add Ed25519 signature verification to all transactions. Verify signatures before adding to mempool and before block inclusion.',
    type: 'build',
    priority: 10,
    estimatedMinutes: 45,
    tags: ['blockchain', 'security', 'crypto']
  },
  {
    id: 'bc-002',
    title: 'Add transaction nonce tracking',
    description: 'Implement nonce tracking per account to prevent replay attacks. Each transaction must have a nonce greater than the last.',
    type: 'build',
    priority: 9,
    estimatedMinutes: 30,
    tags: ['blockchain', 'security']
  },
  {
    id: 'bc-003',
    title: 'Build transaction fee calculation system',
    description: 'Implement gas-like fee system. Calculate fees based on transaction size and complexity. Add fee to block rewards.',
    type: 'build',
    priority: 8,
    estimatedMinutes: 40,
    tags: ['blockchain', 'economics']
  },
  {
    id: 'bc-004',
    title: 'Create block finality mechanism',
    description: 'Implement finality after N confirmations. Track finalized vs pending blocks. Add API endpoint for finality status.',
    type: 'build',
    priority: 8,
    estimatedMinutes: 35,
    tags: ['blockchain', 'consensus']
  },
  {
    id: 'bc-005',
    title: 'Add uncle/ommer block handling',
    description: 'Implement handling for blocks that arrive late but are still valid. Give partial rewards for uncle blocks.',
    type: 'build',
    priority: 6,
    estimatedMinutes: 50,
    tags: ['blockchain', 'consensus']
  },
  {
    id: 'bc-006',
    title: 'Implement chain reorganization logic',
    description: 'Handle chain reorgs when a longer valid chain is discovered. Revert transactions and replay on new chain.',
    type: 'build',
    priority: 9,
    estimatedMinutes: 60,
    tags: ['blockchain', 'consensus']
  },
  {
    id: 'bc-007',
    title: 'Build checkpoint system for fast sync',
    description: 'Create hardcoded checkpoints at regular intervals. Allow new nodes to skip verification before checkpoints.',
    type: 'build',
    priority: 5,
    estimatedMinutes: 35,
    tags: ['blockchain', 'performance']
  },
  {
    id: 'bc-008',
    title: 'Add block size limits and validation',
    description: 'Implement maximum block size. Reject blocks that exceed limit. Add dynamic block size adjustment.',
    type: 'build',
    priority: 7,
    estimatedMinutes: 25,
    tags: ['blockchain', 'validation']
  },
  {
    id: 'bc-009',
    title: 'Create genesis block configuration system',
    description: 'Build system to configure genesis block with initial allocations, parameters, and chain ID.',
    type: 'build',
    priority: 7,
    estimatedMinutes: 30,
    tags: ['blockchain', 'config']
  },
  {
    id: 'bc-010',
    title: 'Implement transaction receipt generation',
    description: 'Generate receipts for all transactions with status, gas used, logs, and bloom filter.',
    type: 'build',
    priority: 8,
    estimatedMinutes: 40,
    tags: ['blockchain', 'api']
  },

  // ============ STATE MANAGEMENT ============
  {
    id: 'sm-001',
    title: 'Implement proper Merkle Patricia Trie',
    description: 'Replace simple state root with full Merkle Patricia Trie. Enable state proofs and light client verification.',
    type: 'build',
    priority: 10,
    estimatedMinutes: 90,
    tags: ['state', 'crypto', 'data-structure']
  },
  {
    id: 'sm-002',
    title: 'Add state pruning for old blocks',
    description: 'Implement state pruning to remove old state data. Keep only recent state and archived checkpoints.',
    type: 'build',
    priority: 6,
    estimatedMinutes: 45,
    tags: ['state', 'performance', 'storage']
  },
  {
    id: 'sm-003',
    title: 'Build state snapshot system',
    description: 'Create periodic state snapshots for fast sync. Compress and store efficiently.',
    type: 'build',
    priority: 5,
    estimatedMinutes: 50,
    tags: ['state', 'sync', 'storage']
  },
  {
    id: 'sm-004',
    title: 'Implement account storage slots',
    description: 'Add key-value storage for each account. Enable smart contract state storage.',
    type: 'build',
    priority: 8,
    estimatedMinutes: 45,
    tags: ['state', 'smart-contracts']
  },
  {
    id: 'sm-005',
    title: 'Add state diff tracking',
    description: 'Track changes between blocks as diffs. Enable efficient state sync and debugging.',
    type: 'build',
    priority: 6,
    estimatedMinutes: 35,
    tags: ['state', 'sync']
  },

  // ============ SMART CONTRACTS ============
  {
    id: 'sc-001',
    title: 'Design CLAW token standard (CRC-20)',
    description: 'Create fungible token standard similar to ERC-20. Define interface for transfer, approve, transferFrom.',
    type: 'build',
    priority: 9,
    estimatedMinutes: 40,
    tags: ['smart-contracts', 'token', 'standard']
  },
  {
    id: 'sc-002',
    title: 'Implement NFT standard (CRC-721)',
    description: 'Create non-fungible token standard. Support minting, burning, transfers, and metadata.',
    type: 'build',
    priority: 7,
    estimatedMinutes: 50,
    tags: ['smart-contracts', 'nft', 'standard']
  },
  {
    id: 'sc-003',
    title: 'Build basic VM for contract execution',
    description: 'Implement simple stack-based VM for executing contract bytecode. Support basic operations.',
    type: 'build',
    priority: 10,
    estimatedMinutes: 120,
    tags: ['smart-contracts', 'vm']
  },
  {
    id: 'sc-004',
    title: 'Add gas metering to VM',
    description: 'Implement gas costs for each VM operation. Halt execution when gas runs out.',
    type: 'build',
    priority: 9,
    estimatedMinutes: 45,
    tags: ['smart-contracts', 'vm', 'gas']
  },
  {
    id: 'sc-005',
    title: 'Create contract deployment system',
    description: 'Build system to deploy contracts via transactions. Generate contract addresses deterministically.',
    type: 'build',
    priority: 8,
    estimatedMinutes: 40,
    tags: ['smart-contracts', 'deployment']
  },
  {
    id: 'sc-006',
    title: 'Implement contract storage CRUD',
    description: 'Add read/write operations for contract storage. Support mappings and arrays.',
    type: 'build',
    priority: 8,
    estimatedMinutes: 35,
    tags: ['smart-contracts', 'storage']
  },
  {
    id: 'sc-007',
    title: 'Build event emission system',
    description: 'Allow contracts to emit events. Store in transaction receipts with bloom filters.',
    type: 'build',
    priority: 7,
    estimatedMinutes: 30,
    tags: ['smart-contracts', 'events']
  },
  {
    id: 'sc-008',
    title: 'Add contract-to-contract calls',
    description: 'Implement CALL opcode for contracts to call other contracts. Handle gas forwarding.',
    type: 'build',
    priority: 8,
    estimatedMinutes: 55,
    tags: ['smart-contracts', 'vm']
  },

  // ============ API & RPC ============
  {
    id: 'api-001',
    title: 'Implement JSON-RPC 2.0 server',
    description: 'Build proper JSON-RPC server. Support batch requests, proper error codes.',
    type: 'build',
    priority: 9,
    estimatedMinutes: 50,
    tags: ['api', 'rpc']
  },
  {
    id: 'api-002',
    title: 'Add getBalance RPC method',
    description: 'Implement Solana-style balance query. Return lamports for account pubkey.',
    type: 'build',
    priority: 8,
    estimatedMinutes: 20,
    tags: ['api', 'rpc', 'solana']
  },
  {
    id: 'api-003',
    title: 'Add getTransaction RPC method',
    description: 'Query transaction by signature. Return full transaction with metadata or null.',
    type: 'build',
    priority: 8,
    estimatedMinutes: 20,
    tags: ['api', 'rpc', 'solana']
  },
  {
    id: 'api-004',
    title: 'Add getBlock RPC method',
    description: 'Query block by slot number. Support transaction details and encoding options.',
    type: 'build',
    priority: 8,
    estimatedMinutes: 25,
    tags: ['api', 'rpc', 'solana']
  },
  {
    id: 'api-005',
    title: 'Implement sendTransaction RPC',
    description: 'Accept base64-encoded signed transactions, validate, and broadcast to network.',
    type: 'build',
    priority: 9,
    estimatedMinutes: 30,
    tags: ['api', 'rpc', 'solana']
  },
  {
    id: 'api-006',
    title: 'Add simulateTransaction RPC',
    description: 'Simulate transaction execution without submitting. Return logs and compute units.',
    type: 'build',
    priority: 8,
    estimatedMinutes: 35,
    tags: ['api', 'rpc', 'solana', 'programs']
  },
  {
    id: 'api-007',
    title: 'Implement getAccountInfo RPC',
    description: 'Return account data, lamports, owner, and executable flag for pubkey.',
    type: 'build',
    priority: 7,
    estimatedMinutes: 30,
    tags: ['api', 'rpc', 'solana']
  },
  {
    id: 'api-008',
    title: 'Add getSignaturesForAddress RPC',
    description: 'Query transaction signatures for an address with pagination support.',
    type: 'build',
    priority: 7,
    estimatedMinutes: 40,
    tags: ['api', 'rpc', 'solana']
  },
  {
    id: 'api-009',
    title: 'Build WebSocket subscription system',
    description: 'Support newHeads, logs, and pendingTransactions subscriptions via WebSocket.',
    type: 'build',
    priority: 7,
    estimatedMinutes: 55,
    tags: ['api', 'websocket']
  },
  {
    id: 'api-010',
    title: 'Add GraphQL API layer',
    description: 'Build GraphQL schema for blockchain queries. Support nested queries for blocks, transactions.',
    type: 'build',
    priority: 5,
    estimatedMinutes: 60,
    tags: ['api', 'graphql']
  },

  // ============ WALLET & CRYPTO ============
  {
    id: 'wallet-001',
    title: 'Implement HD wallet derivation',
    description: 'Add BIP-32/44 hierarchical deterministic wallet support. Generate addresses from seed.',
    type: 'build',
    priority: 8,
    estimatedMinutes: 45,
    tags: ['wallet', 'crypto']
  },
  {
    id: 'wallet-002',
    title: 'Add mnemonic phrase generation',
    description: 'Implement BIP-39 mnemonic phrases for wallet backup. Support 12/24 word phrases.',
    type: 'build',
    priority: 8,
    estimatedMinutes: 35,
    tags: ['wallet', 'crypto']
  },
  {
    id: 'wallet-003',
    title: 'Build encrypted keypair storage',
    description: 'Implement encrypted keypair files using Solana CLI format. Use argon2 for key derivation.',
    type: 'build',
    priority: 7,
    estimatedMinutes: 40,
    tags: ['wallet', 'security']
  },
  {
    id: 'wallet-004',
    title: 'Create transaction signing library',
    description: 'Build library for signing transactions client-side. Support different signature schemes.',
    type: 'build',
    priority: 9,
    estimatedMinutes: 35,
    tags: ['wallet', 'crypto']
  },
  {
    id: 'wallet-005',
    title: 'Add multi-signature wallet support',
    description: 'Implement M-of-N multisig transactions. Aggregate signatures for verification.',
    type: 'build',
    priority: 6,
    estimatedMinutes: 60,
    tags: ['wallet', 'security']
  },
  {
    id: 'wallet-006',
    title: 'Build hardware wallet integration',
    description: 'Add support for Ledger/Trezor signing via USB. Implement transport layer.',
    type: 'build',
    priority: 5,
    estimatedMinutes: 70,
    tags: ['wallet', 'hardware']
  },

  // ============ NETWORKING ============
  {
    id: 'net-001',
    title: 'Implement peer discovery protocol',
    description: 'Build Kademlia-like DHT for peer discovery. Support bootstrap nodes.',
    type: 'build',
    priority: 8,
    estimatedMinutes: 60,
    tags: ['networking', 'p2p']
  },
  {
    id: 'net-002',
    title: 'Add block propagation system',
    description: 'Broadcast new blocks to peers efficiently. Use compact block relay.',
    type: 'build',
    priority: 8,
    estimatedMinutes: 45,
    tags: ['networking', 'sync']
  },
  {
    id: 'net-003',
    title: 'Build transaction gossip protocol',
    description: 'Propagate transactions to peers. Prevent duplicate broadcasts.',
    type: 'build',
    priority: 8,
    estimatedMinutes: 40,
    tags: ['networking', 'mempool']
  },
  {
    id: 'net-004',
    title: 'Implement block sync protocol',
    description: 'Request missing blocks from peers. Handle parallel downloads.',
    type: 'build',
    priority: 9,
    estimatedMinutes: 55,
    tags: ['networking', 'sync']
  },
  {
    id: 'net-005',
    title: 'Add peer reputation system',
    description: 'Track peer behavior. Ban misbehaving peers. Prefer reliable peers.',
    type: 'build',
    priority: 6,
    estimatedMinutes: 35,
    tags: ['networking', 'security']
  },

  // ============ FRONTEND ============
  {
    id: 'fe-001',
    title: 'Build block explorer page',
    description: 'Create page showing all blocks with height, hash, tx count, timestamp.',
    type: 'build',
    priority: 8,
    estimatedMinutes: 45,
    tags: ['frontend', 'explorer']
  },
  {
    id: 'fe-002',
    title: 'Add transaction explorer',
    description: 'Show transaction details including sender, receiver, amount, status.',
    type: 'build',
    priority: 8,
    estimatedMinutes: 40,
    tags: ['frontend', 'explorer']
  },
  {
    id: 'fe-003',
    title: 'Create address page',
    description: 'Show address balance, transaction history, and token holdings.',
    type: 'build',
    priority: 7,
    estimatedMinutes: 45,
    tags: ['frontend', 'explorer']
  },
  {
    id: 'fe-004',
    title: 'Build network stats dashboard',
    description: 'Display TPS, block time, difficulty, hashrate, active addresses.',
    type: 'build',
    priority: 6,
    estimatedMinutes: 35,
    tags: ['frontend', 'analytics']
  },
  {
    id: 'fe-005',
    title: 'Add real-time transaction feed',
    description: 'Show live stream of transactions as they enter mempool and get confirmed.',
    type: 'build',
    priority: 6,
    estimatedMinutes: 30,
    tags: ['frontend', 'realtime']
  },
  {
    id: 'fe-006',
    title: 'Create token tracker page',
    description: 'List all CRC-20 tokens with supply, holders, and recent transfers.',
    type: 'build',
    priority: 5,
    estimatedMinutes: 40,
    tags: ['frontend', 'tokens']
  },
  {
    id: 'fe-007',
    title: 'Build contract verification UI',
    description: 'Allow users to submit source code for contract verification.',
    type: 'build',
    priority: 5,
    estimatedMinutes: 45,
    tags: ['frontend', 'smart-contracts']
  },
  {
    id: 'fe-008',
    title: 'Add dark/light theme toggle',
    description: 'Implement theme switching with proper CSS variables. Save preference.',
    type: 'build',
    priority: 4,
    estimatedMinutes: 25,
    tags: ['frontend', 'ux']
  },
  {
    id: 'fe-009',
    title: 'Create mobile-responsive navigation',
    description: 'Improve mobile experience with hamburger menu and touch-friendly UI.',
    type: 'build',
    priority: 5,
    estimatedMinutes: 30,
    tags: ['frontend', 'mobile']
  },
  {
    id: 'fe-010',
    title: 'Build wallet connection flow',
    description: 'Add MetaMask-style connection modal. Handle account switching.',
    type: 'build',
    priority: 7,
    estimatedMinutes: 40,
    tags: ['frontend', 'wallet']
  },

  // ============ TESTING ============
  {
    id: 'test-001',
    title: 'Write unit tests for Block class',
    description: 'Test block creation, validation, serialization, hash calculation.',
    type: 'test',
    priority: 8,
    estimatedMinutes: 35,
    tags: ['testing', 'blockchain']
  },
  {
    id: 'test-002',
    title: 'Add integration tests for StateManager',
    description: 'Test balance updates, state root calculation, transaction application.',
    type: 'test',
    priority: 8,
    estimatedMinutes: 40,
    tags: ['testing', 'state']
  },
  {
    id: 'test-003',
    title: 'Create API endpoint tests',
    description: 'Test all RPC endpoints with valid and invalid inputs.',
    type: 'test',
    priority: 7,
    estimatedMinutes: 50,
    tags: ['testing', 'api']
  },
  {
    id: 'test-004',
    title: 'Write transaction validation tests',
    description: 'Test signature verification, nonce validation, balance checks.',
    type: 'test',
    priority: 8,
    estimatedMinutes: 35,
    tags: ['testing', 'validation']
  },
  {
    id: 'test-005',
    title: 'Add stress tests for block production',
    description: 'Test block production under high transaction load.',
    type: 'test',
    priority: 6,
    estimatedMinutes: 45,
    tags: ['testing', 'performance']
  },
  {
    id: 'test-006',
    title: 'Create chain reorganization tests',
    description: 'Test reorg scenarios with competing chains.',
    type: 'test',
    priority: 7,
    estimatedMinutes: 50,
    tags: ['testing', 'consensus']
  },

  // ============ DOCUMENTATION ============
  {
    id: 'docs-001',
    title: 'Write API documentation',
    description: 'Document all RPC methods with examples, parameters, return values.',
    type: 'docs',
    priority: 7,
    estimatedMinutes: 60,
    tags: ['documentation', 'api']
  },
  {
    id: 'docs-002',
    title: 'Create architecture overview',
    description: 'Document system architecture with diagrams showing component interactions.',
    type: 'docs',
    priority: 6,
    estimatedMinutes: 45,
    tags: ['documentation', 'architecture']
  },
  {
    id: 'docs-003',
    title: 'Write smart contract developer guide',
    description: 'Guide for writing and deploying contracts on ClawChain.',
    type: 'docs',
    priority: 6,
    estimatedMinutes: 50,
    tags: ['documentation', 'smart-contracts']
  },
  {
    id: 'docs-004',
    title: 'Document token standards (CRC-20/721)',
    description: 'Specification documents for ClawChain token standards.',
    type: 'docs',
    priority: 5,
    estimatedMinutes: 40,
    tags: ['documentation', 'standards']
  },
  {
    id: 'docs-005',
    title: 'Create node operator guide',
    description: 'Instructions for running a ClawChain node. Hardware requirements, configuration.',
    type: 'docs',
    priority: 5,
    estimatedMinutes: 35,
    tags: ['documentation', 'operations']
  },

  // ============ SECURITY & AUDITING ============
  {
    id: 'sec-001',
    title: 'Audit StateManager for race conditions',
    description: 'Review concurrent access patterns. Add proper locking where needed.',
    type: 'audit',
    priority: 9,
    estimatedMinutes: 40,
    tags: ['security', 'audit']
  },
  {
    id: 'sec-002',
    title: 'Review transaction validation logic',
    description: 'Check for integer overflows, replay attacks, signature malleability.',
    type: 'audit',
    priority: 9,
    estimatedMinutes: 45,
    tags: ['security', 'audit']
  },
  {
    id: 'sec-003',
    title: 'Audit API input validation',
    description: 'Check all user inputs for injection, overflow, type confusion.',
    type: 'audit',
    priority: 8,
    estimatedMinutes: 35,
    tags: ['security', 'api']
  },
  {
    id: 'sec-004',
    title: 'Review cryptographic implementations',
    description: 'Verify correct use of crypto primitives. Check for timing attacks.',
    type: 'audit',
    priority: 9,
    estimatedMinutes: 50,
    tags: ['security', 'crypto']
  },
  {
    id: 'sec-005',
    title: 'Add rate limiting to public endpoints',
    description: 'Implement rate limits to prevent DoS. Track by IP and API key.',
    type: 'build',
    priority: 7,
    estimatedMinutes: 30,
    tags: ['security', 'api']
  },

  // ============ PERFORMANCE ============
  {
    id: 'perf-001',
    title: 'Optimize block validation',
    description: 'Profile and optimize block validation. Use parallel verification.',
    type: 'refactor',
    priority: 7,
    estimatedMinutes: 45,
    tags: ['performance', 'blockchain']
  },
  {
    id: 'perf-002',
    title: 'Add database query caching',
    description: 'Cache frequent queries. Implement LRU eviction.',
    type: 'build',
    priority: 6,
    estimatedMinutes: 35,
    tags: ['performance', 'database']
  },
  {
    id: 'perf-003',
    title: 'Implement bloom filters for log queries',
    description: 'Use bloom filters to quickly filter blocks for event queries.',
    type: 'build',
    priority: 6,
    estimatedMinutes: 40,
    tags: ['performance', 'events']
  },
  {
    id: 'perf-004',
    title: 'Optimize state trie operations',
    description: 'Cache trie nodes. Batch database writes. Use lazy loading.',
    type: 'refactor',
    priority: 7,
    estimatedMinutes: 50,
    tags: ['performance', 'state']
  },
  {
    id: 'perf-005',
    title: 'Add connection pooling for database',
    description: 'Implement proper connection pooling. Handle connection failures.',
    type: 'build',
    priority: 6,
    estimatedMinutes: 25,
    tags: ['performance', 'database']
  },

  // ============ DEVOPS & TOOLING ============
  {
    id: 'ops-001',
    title: 'Create Docker multi-stage build',
    description: 'Optimize Docker image size with multi-stage builds.',
    type: 'build',
    priority: 6,
    estimatedMinutes: 30,
    tags: ['devops', 'docker']
  },
  {
    id: 'ops-002',
    title: 'Add Prometheus metrics',
    description: 'Export metrics for block production, transactions, peers, etc.',
    type: 'build',
    priority: 6,
    estimatedMinutes: 40,
    tags: ['devops', 'monitoring']
  },
  {
    id: 'ops-003',
    title: 'Create Grafana dashboard',
    description: 'Build dashboard showing chain health, performance, alerts.',
    type: 'build',
    priority: 5,
    estimatedMinutes: 45,
    tags: ['devops', 'monitoring']
  },
  {
    id: 'ops-004',
    title: 'Add health check endpoints',
    description: 'Implement /health and /ready for container orchestration.',
    type: 'build',
    priority: 7,
    estimatedMinutes: 20,
    tags: ['devops', 'api']
  },
  {
    id: 'ops-005',
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for build, test, deploy.',
    type: 'build',
    priority: 7,
    estimatedMinutes: 50,
    tags: ['devops', 'ci']
  },

  // ============ ADVANCED FEATURES ============
  {
    id: 'adv-001',
    title: 'Implement state channels',
    description: 'Build layer 2 state channel system for instant off-chain transactions.',
    type: 'build',
    priority: 5,
    estimatedMinutes: 90,
    tags: ['layer2', 'scaling']
  },
  {
    id: 'adv-002',
    title: 'Add Wormhole bridge integration',
    description: 'Design bridge architecture for cross-chain messaging via Wormhole protocol.',
    type: 'build',
    priority: 5,
    estimatedMinutes: 80,
    tags: ['wormhole', 'interoperability', 'solana']
  },
  {
    id: 'adv-003',
    title: 'Build governance voting system',
    description: 'Implement on-chain voting for protocol upgrades. Use token-weighted voting.',
    type: 'build',
    priority: 6,
    estimatedMinutes: 60,
    tags: ['governance', 'voting']
  },
  {
    id: 'adv-004',
    title: 'Add zk-SNARK verification',
    description: 'Implement verifier for zero-knowledge proofs. Enable private transactions.',
    type: 'build',
    priority: 4,
    estimatedMinutes: 100,
    tags: ['crypto', 'privacy']
  },
  {
    id: 'adv-005',
    title: 'Build oracle system',
    description: 'Create oracle for bringing external data on-chain. Use commit-reveal.',
    type: 'build',
    priority: 5,
    estimatedMinutes: 55,
    tags: ['oracle', 'data']
  },
  {
    id: 'adv-006',
    title: 'Implement account abstraction',
    description: 'Allow smart contract wallets with custom validation logic.',
    type: 'build',
    priority: 5,
    estimatedMinutes: 70,
    tags: ['wallet', 'abstraction']
  },
  {
    id: 'adv-007',
    title: 'Add MEV protection',
    description: 'Implement fair ordering to prevent front-running and sandwich attacks.',
    type: 'build',
    priority: 6,
    estimatedMinutes: 65,
    tags: ['security', 'mev']
  },
  {
    id: 'adv-008',
    title: 'Build staking rewards system',
    description: 'Implement staking with compound interest. Track delegations.',
    type: 'build',
    priority: 7,
    estimatedMinutes: 55,
    tags: ['staking', 'economics']
  }
];

// Calculate total estimated time
export const getTotalEstimatedTime = (): { minutes: number; hours: number; days: number } => {
  const minutes = TASK_BACKLOG.reduce((sum, task) => sum + task.estimatedMinutes, 0);
  return {
    minutes,
    hours: Math.round(minutes / 60 * 10) / 10,
    days: Math.round(minutes / 60 / 24 * 10) / 10
  };
};

// Get tasks by priority
export const getTasksByPriority = (): BacklogTask[] => {
  return [...TASK_BACKLOG].sort((a, b) => b.priority - a.priority);
};

// Get tasks by type
export const getTasksByType = (type: BacklogTask['type']): BacklogTask[] => {
  return TASK_BACKLOG.filter(t => t.type === type);
};

// Get unstarted task (for task sources)
let completedTaskIds = new Set<string>();

export const getNextBacklogTask = (): BacklogTask | null => {
  const sorted = getTasksByPriority();
  for (const task of sorted) {
    if (!completedTaskIds.has(task.id)) {
      return task;
    }
  }
  // All tasks done - reset and start over
  completedTaskIds = new Set();
  return sorted[0] || null;
};

export const markBacklogTaskComplete = (taskId: string): void => {
  completedTaskIds.add(taskId);
};

export const getBacklogProgress = (): { completed: number; total: number; percent: number } => {
  const completed = completedTaskIds.size;
  const total = TASK_BACKLOG.length;
  return {
    completed,
    total,
    percent: Math.round((completed / total) * 100)
  };
};

console.log(`[BACKLOG] Loaded ${TASK_BACKLOG.length} tasks (${getTotalEstimatedTime().hours} hours estimated)`);
