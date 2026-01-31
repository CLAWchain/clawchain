export class Block {
  blockNumber: number;
  timestamp: number;
  transactions: Transaction[];
  finalized: boolean;

  constructor(blockNumber: number, timestamp: number, transactions: Transaction[]) {
    this.blockNumber = blockNumber;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.finalized = false;
  }
}

export class Transaction {
  // Define transaction properties here
}