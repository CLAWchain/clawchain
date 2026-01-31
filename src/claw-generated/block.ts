export class Block {
  hash: string;
  prevHash: string;
  timestamp: number;
  transactions: any[];
  finalized: boolean;
  confirmations: number;

  constructor(prevHash: string, transactions: any[]) {
    this.prevHash = prevHash;
    this.transactions = transactions;
    this.timestamp = Date.now();
    this.hash = this.calculateHash();
    this.finalized = false;
    this.confirmations = 0;
  }

  calculateHash(): string {
    // Implement hash calculation logic
    return `${this.prevHash}:${this.timestamp}:${JSON.stringify(this.transactions)}`;
  }
}