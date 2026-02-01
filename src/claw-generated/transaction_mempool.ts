import { Transaction } from '../transaction';

class TransactionMempool {
  private transactions: Map<string, Transaction>;

  constructor() {
    this.transactions = new Map();
  }

  addTransaction(tx: Transaction): void {
    const txHash = tx.hash();
    if (!this.transactions.has(txHash)) {
      this.transactions.set(txHash, tx);
    }
  }

  getTransaction(txHash: string): Transaction | undefined {
    return this.transactions.get(txHash);
  }

  removeTransaction(txHash: string): void {
    this.transactions.delete(txHash);
  }

  getAll(): Transaction[] {
    return Array.from(this.transactions.values());
  }
}

export { TransactionMempool };