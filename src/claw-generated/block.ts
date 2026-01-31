export class Block {
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  hash: string;

  constructor(
    timestamp: number,
    transactions: Transaction[],
    previousHash: string
  ) {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash(): string {
    // Implement hash calculation logic
    return ''; 
  }
}

export class Transaction {
  from: string;
  to: string;
  amount: number;
  nonce: number;

  constructor(from: string, to: string, amount: number, nonce: number) {
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.nonce = nonce;
  }
}