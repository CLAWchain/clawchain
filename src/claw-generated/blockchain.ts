import { Block, Transaction } from './block';

const MAX_BLOCK_SIZE = 1000000; // 1 MB
const BLOCK_SIZE_TARGET = 750000; // 750 KB
const BLOCK_SIZE_ADJUSTMENT_FACTOR = 1.1; // 10% increase/decrease

export class Blockchain {
  private chain: Block[] = [];
  private pendingTransactions: Transaction[] = [];

  addTransaction(transaction: Transaction): void {
    this.pendingTransactions.push(transaction);
  }

  mineBlock(): void {
    const block = new Block(
      this.chain.length,
      Date.now(),
      this.pendingTransactions,
      this.chain.length > 0 ? this.chain[this.chain.length - 1].hash : '',
      '',
      0
    );

    // Validate block size
    const blockSize = this.calculateBlockSize(block);
    if (blockSize > MAX_BLOCK_SIZE) {
      throw new Error('Block size exceeds maximum limit');
    }

    // Adjust maximum block size
    if (blockSize > BLOCK_SIZE_TARGET) {
      MAX_BLOCK_SIZE = Math.min(MAX_BLOCK_SIZE * BLOCK_SIZE_ADJUSTMENT_FACTOR, 2 * BLOCK_SIZE_TARGET);
    } else {
      MAX_BLOCK_SIZE = Math.max(MAX_BLOCK_SIZE / BLOCK_SIZE_ADJUSTMENT_FACTOR, BLOCK_SIZE_TARGET / 2);
    }

    // Mine the block
    block.hash = this.calculateBlockHash(block);
    this.chain.push(block);
    this.pendingTransactions = [];
  }

  private calculateBlockSize(block: Block): number {
    // Implement logic to calculate the size of the block in bytes
    return JSON.stringify(block).length;
  }

  private calculateBlockHash(block: Block): string {
    // Implement logic to calculate the hash of the block
    return 'placeholder_hash';
  }
}