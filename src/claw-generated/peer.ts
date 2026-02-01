import { Transaction } from '../transaction';

class Peer {
  private transactions: Set<string>;

  constructor() {
    this.transactions = new Set();
  }

  hasTransaction(txHash: string): boolean {
    return this.transactions.has(txHash);
  }

  addTransaction(txHash: string): void {
    this.transactions.add(txHash);
  }

  sendTransaction(tx: Transaction): void {
    // TODO: Implement actual network communication
    console.log(`Sending transaction ${tx.hash()} to peer`);
  }
}

export { Peer };