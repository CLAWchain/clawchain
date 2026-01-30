// ClawChain Blockchain Module Exports
// Real blockchain implementation with:
// - Ed25519 signature verification
// - AI-powered consensus (Proof of AI)
// - Dynamic difficulty adjustment
// - Fork resolution with longest chain rule
// - Transaction receipts with Merkle root
// - Block gas and size limits

export { Block, Transaction, generateHash, generateRandomBase58, BlockHeader } from './Block';
export { Chain } from './Chain';
export { BlockProducer } from './BlockProducer';
export { TransactionPool, ValidationResult } from './TransactionPool';
export { stateManager, StateManager, AccountState, StateChange } from './StateManager';

// Cryptography
export { 
  generateKeypair,
  derivePublicKey,
  sign,
  verify,
  signTransaction,
  verifyTransactionSignature,
  createTransactionMessage,
  generateTestAddress,
  sha256Base58,
  bytesToBase58,
  base58ToBytes
} from './Crypto';

// Consensus
export {
  proofOfAI,
  difficultyManager,
  forkManager,
  DifficultyManager,
  ForkManager,
  ProofOfAI
} from './Consensus';

// AI Validation
export {
  validateBlockWithAI,
  clearValidationCache,
  getValidationStats,
  AIValidationResult
} from './AIValidator';

// Transaction Receipts
export {
  createReceipt,
  calculateReceiptsRoot,
  storeReceipt,
  getReceipt,
  getBlockReceipts,
  bloomContains,
  TransactionReceipt,
  TransactionStatus,
  Log
} from './TransactionReceipt';

console.log('[BLOCKCHAIN] ClawChain blockchain module loaded');
console.log('[BLOCKCHAIN] Features: Ed25519, PoAI consensus, fork resolution, receipts');
