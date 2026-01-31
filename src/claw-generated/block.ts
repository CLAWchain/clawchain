import crypto from 'crypto';

// Base58 alphabet (Solana style - no 0, O, I, l)
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

// Convert hex to base58
function hexToBase58(hex: string): string {
  const bytes = Buffer.from(hex, 'hex');
  let num = BigInt('0x' + hex);
  let result = '';

  while (num > 0n) {
    const remainder = Number(num % 58n);
    result = BASE58_ALPHABET[remainder] + result;
    num = num / 58n;
  }

  // Add leading '1's for each leading zero byte
  for (const byte of bytes) {
    if (byte === 0) {
      result = '1' + result;
    } else {
      break;
    }
  }

  return result || '1';
}

// Generate Solana-style hash
function generateHash(data: string): string {
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return hexToBase58(hash);
}

// Generate random base58 string
function generateRandomBase58(length: number = 44): string {
  const bytes = crypto.randomBytes(32);
  return hexToBase58(bytes.toString('hex')).substring(0, length);
}

export interface BlockHeader {
  height: number;
  hash: string;
  parentHash: string;
  producer: string;
  timestamp: number;
  nonce: number;
  difficulty: number;
  gasUsed: bigint;
  gasLimit: bigint;
  stateRoot: string;
  transactionsRoot: string;
  receiptsRoot: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: bigint;
  gasPrice: bigint;
  gasLimit: bigint;
  nonce: number;
  data?: string;
  signature: string;
}

export interface UncleBlock {
  block: Block;
  reward: bigint;
}

export class Block {
  public header: BlockHeader;
  public transactions: Transaction[];
  public uncleBlocks: UncleBlock[] = [];

  constructor(
    height: number,
    parentHash: string,
    producer: string,
    transactions: Transaction[],
    difficulty: number = 1
  ) {
    this.transactions = transactions;

    const gasUsed = this.calculateGasUsed();
    const transactionsRoot = this.calculateMerkleRoot(transactions.map(tx => tx.hash));

    this.header = {
      height,
      hash: '', // Will be calculated
      parentHash,
      producer,
      timestamp: Date.now(),
      nonce: 0,
      difficulty,
      gasUsed,
      gasLimit: 30000000n,
      stateRoot: this.calculateStateRoot(),
      transactionsRoot,
      receiptsRoot: this.calculateReceiptsRoot()
    };

    this.header.hash = this.calculateHash();
  }

  private calculateHash(): string {
    const data = JSON.stringify({
      height: this.header.height,
      parentHash: this.header.parentHash,
      producer: this.header.producer,
      timestamp: this.header.timestamp,
      nonce: this.header.nonce,
      transactionsRoot: this.header.transactionsRoot,
      stateRoot: this.header.stateRoot
    });

    return generateHash(data);
  }

  private calculateGasUsed(): bigint {
    return this.transactions.reduce((sum, tx) => sum + tx.gasLimit, 0n);
  }

  private calculateMerkleRoot(hashes: string[]): string {
    if (hashes.length === 0) return generateRandomBase58(44);
    if (hashes.length === 1) return hashes[0];

    const newLevel: string[] = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = hashes[i + 1] || hashes[i];
      const combined = left + right;
      newLevel.push(generateHash(combined));
    }

    return this.calculateMerkleRoot(newLevel);
  }

  private calculateStateRoot(): string {
    // State root is calculated by StateManager and passed in
    // This returns a placeholder that gets overridden
    return generateRandomBase58(44);
  }

  // Set state root from StateManager
  public setStateRoot(stateRoot: string): void {
    this.header.stateRoot = stateRoot;
    // Recalculate block hash with new state root
    this.header.hash = this.calculateHash();
  }

  private calculateReceiptsRoot(): string {
    return generateRandomBase58(44);
  }

  public isValid(previousBlock?: Block): boolean {
    if (this.header.hash !== this.calculateHash()) {
      return false;
    }

    if (previousBlock && this.header.parentHash !== previousBlock.header.hash) {
      return false;
    }

    if (previousBlock && this.header.height !== previousBlock.header.height + 1) {
      return false;
    }

    if (previousBlock && this.header.timestamp <= previousBlock.header.timestamp) {
      return false;
    }

    return true;
  }

  public isUncle(previousBlock: Block): boolean {
    if (!previousBlock) return false;
    if (this.header.parentHash === previousBlock.header.hash) return false;
    if (this.header.height !== previousBlock.header.height + 1) return false;
    if (this.header.timestamp <= previousBlock.header.timestamp) return false;
    return true;
  }

  public addUncle(uncleBlock: UncleBlock): void {
    this.uncleBlocks.push(uncleBlock);
  }

  public toJSON() {
    return {
      ...this.header,
      gasUsed: this.header.gasUsed.toString(),
      gasLimit: this.header.gasLimit.toString(),
      transactions: this.transactions.map(tx => ({
        ...tx,
        value: tx.value.toString(),
        gasPrice: tx.gasPrice.toString(),
        gasLimit: tx.gasLimit.toString()
      })),
      uncleBlocks: this.uncleBlocks.map(uncle => ({
        block: uncle.block.toJSON(),
        reward: uncle.reward.toString()
      }))
    };
  }
}

// Export helper functions
export { generateHash, generateRandomBase58, hexToBase58 };