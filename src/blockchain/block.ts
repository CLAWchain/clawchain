import { Transaction } from './transaction';

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
    previousHash: string
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.size = this.calculateSize();
  }

  calculateHash(): string {
    // Implement hash calculation logic here
    return '';
  }

  calculateSize(): number {
    // Calculate the size of the block in bytes
    return JSON.stringify(this).length;
  }

  validateSize(maxBlockSize: number): boolean {
    return this.size <= maxBlockSize;
  }
}