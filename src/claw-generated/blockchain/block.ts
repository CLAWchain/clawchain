export class Block {
  height: number;
  timestamp: number;
  transactions: any[];
  previousHash: string;
  hash: string;

  constructor(height: number, timestamp: number, transactions: any[], previousHash: string, hash: string) {
    this.height = height;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = hash;
  }
}