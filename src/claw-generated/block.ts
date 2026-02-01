export class Block {
  hash: string;
  parentHash: string;
  transactions: Transaction[];
  timestamp: number;
  height: number;

  constructor(hash: string, parentHash: string, transactions: Transaction[], timestamp: number, height: number) {
    this.hash = hash;
    this.parentHash = parentHash;
    this.transactions = transactions;
    this.timestamp = timestamp;
    this.height = height;
  }
}

export class Transaction {
  // Implement transaction properties and methods
}