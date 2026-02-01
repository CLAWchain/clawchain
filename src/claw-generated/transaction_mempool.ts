import { Transaction } from '../transaction';
import { VRFGenerator } from './vrf';

class TransactionMempool {
  private transactions: Map<string, { transaction: Transaction, orderIndex: number }>;
  private vrfGenerator: VRFGenerator;

  constructor() {
    this.transactions = new Map();
    this.vrfGenerator = new VRFGenerator();
  }

  addTransaction(tx: Transaction): void {
    const txHash = tx.hash();
    if (!this.transactions.has(txHash)) {
      const orderIndex = this.vrfGenerator.generateOrderIndex();
      this.transactions.set(txHash, { transaction: tx, orderIndex });
    }
  }

  getTransaction(txHash: string): Transaction | undefined {
    const txData = this.transactions.get(txHash);
    return txData?.transaction;
  }

  removeTransaction(txHash: string): void {
    this.transactions.delete(txHash);
  }

  getAll(): Transaction[] {
    return Array.from(this.transactions.values())
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(({ transaction }) => transaction);
  }
}

export { TransactionMempool };