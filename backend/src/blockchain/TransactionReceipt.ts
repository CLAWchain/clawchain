import crypto from 'crypto';
import { Transaction, generateHash } from './Block';

// Transaction execution status
export enum TransactionStatus {
  SUCCESS = 1,
  FAILURE = 0,
  OUT_OF_GAS = 2,
  INVALID_SIGNATURE = 3,
  INSUFFICIENT_BALANCE = 4,
  INVALID_NONCE = 5
}

// Log entry emitted during transaction execution
export interface Log {
  address: string;      // Contract address that emitted the log
  topics: string[];     // Indexed event parameters
  data: string;         // Non-indexed event data
  logIndex: number;     // Position in the block
  transactionIndex: number;
  transactionHash: string;
  blockHash: string;
  blockNumber: number;
}

// Transaction receipt
export interface TransactionReceipt {
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  blockNumber: number;
  from: string;
  to: string;
  gasUsed: bigint;
  cumulativeGasUsed: bigint;
  status: TransactionStatus;
  logs: Log[];
  logsBloom: string;    // Bloom filter for quick log searching
  stateRoot?: string;   // Post-transaction state root (optional)
}

// Create a bloom filter for logs (simplified)
function createLogsBloom(logs: Log[]): string {
  // 256-byte bloom filter
  const bloom = Buffer.alloc(256);
  
  for (const log of logs) {
    // Add address to bloom
    addToBloom(bloom, log.address);
    
    // Add topics to bloom
    for (const topic of log.topics) {
      addToBloom(bloom, topic);
    }
  }
  
  return bloom.toString('hex');
}

// Add item to bloom filter
function addToBloom(bloom: Buffer, item: string): void {
  const hash = crypto.createHash('sha256').update(item).digest();
  
  // Use first 6 bytes to set 3 bits
  for (let i = 0; i < 3; i++) {
    const index = (hash[i * 2] << 8 | hash[i * 2 + 1]) % 2048;
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    bloom[byteIndex] |= (1 << bitIndex);
  }
}

// Check if item might be in bloom filter
export function bloomContains(bloomHex: string, item: string): boolean {
  const bloom = Buffer.from(bloomHex, 'hex');
  const hash = crypto.createHash('sha256').update(item).digest();
  
  for (let i = 0; i < 3; i++) {
    const index = (hash[i * 2] << 8 | hash[i * 2 + 1]) % 2048;
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    if ((bloom[byteIndex] & (1 << bitIndex)) === 0) {
      return false;
    }
  }
  return true;
}

// Create a receipt from a transaction execution
export function createReceipt(
  tx: Transaction,
  index: number,
  blockHash: string,
  blockNumber: number,
  gasUsed: bigint,
  cumulativeGasUsed: bigint,
  status: TransactionStatus,
  logs: Log[] = [],
  stateRoot?: string
): TransactionReceipt {
  return {
    transactionHash: tx.hash,
    transactionIndex: index,
    blockHash,
    blockNumber,
    from: tx.from,
    to: tx.to,
    gasUsed,
    cumulativeGasUsed,
    status,
    logs,
    logsBloom: createLogsBloom(logs),
    stateRoot
  };
}

// Calculate receipts Merkle root
export function calculateReceiptsRoot(receipts: TransactionReceipt[]): string {
  if (receipts.length === 0) {
    return generateHash('empty_receipts');
  }
  
  const receiptHashes = receipts.map(receipt => {
    const data = JSON.stringify({
      transactionHash: receipt.transactionHash,
      status: receipt.status,
      gasUsed: receipt.gasUsed.toString(),
      cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
      logsBloom: receipt.logsBloom,
      logs: receipt.logs
    });
    return generateHash(data);
  });
  
  return buildMerkleRoot(receiptHashes);
}

// Build Merkle root from hashes
function buildMerkleRoot(hashes: string[]): string {
  if (hashes.length === 1) return hashes[0];
  
  const nextLevel: string[] = [];
  for (let i = 0; i < hashes.length; i += 2) {
    const left = hashes[i];
    const right = hashes[i + 1] || left;
    nextLevel.push(generateHash(left + right));
  }
  
  return buildMerkleRoot(nextLevel);
}

// Encode receipt for RLP (simplified)
export function encodeReceipt(receipt: TransactionReceipt): string {
  return JSON.stringify({
    status: receipt.status,
    gasUsed: receipt.gasUsed.toString(),
    logsBloom: receipt.logsBloom,
    logs: receipt.logs
  });
}

// Storage for receipts by transaction hash
const receiptStore = new Map<string, TransactionReceipt>();

// Store a receipt
export function storeReceipt(receipt: TransactionReceipt): void {
  receiptStore.set(receipt.transactionHash, receipt);
}

// Get a receipt by transaction hash
export function getReceipt(txHash: string): TransactionReceipt | undefined {
  return receiptStore.get(txHash);
}

// Get all receipts for a block
export function getBlockReceipts(blockNumber: number): TransactionReceipt[] {
  return Array.from(receiptStore.values())
    .filter(r => r.blockNumber === blockNumber);
}

console.log('[RECEIPTS] Transaction receipt system loaded');
