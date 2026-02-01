import { Transaction } from './transaction';
import { BlockSizeManager } from './block-size-manager';

export class Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  size: number;

  constructor(
    index: number,
    timestamp: number,
    transactions: Transaction[],
    previousHash: string,
    hash: string
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = hash;
    this.size = this.calculateSize();
  }

  calculateSize(): number {
    // Calculate the total byte size of the block
    const headerSize =
      Buffer.byteLength(this.index.toString()) +
      Buffer.byteLength(this.timestamp.toString()) +
      Buffer.byteLength(this.previousHash) +
      Buffer.byteLength(this.hash);

    const transactionSize = this.transactions.reduce((total, tx) => {
      return total + tx.size;
    }, 0);

    return headerSize + transactionSize;
  }

  validate(): boolean {
    // Check if the block size is within the limit
    const maxBlockSize = BlockSizeManager.getInstance().getMaxBlockSize();
    return this.size <= maxBlockSize;
  }
}