import { Transaction } from './transaction';

export class TransactionPool {
  private transactions: Transaction[] = [];
  private transactionOrder: Map<string, number> = new Map();

  addTransaction(tx: Transaction): void {
    this.transactions.push(tx);
    this.transactionOrder.set(this.getTransactionHash(tx), this.transactions.length - 1);
  }

  getTransactions(): Transaction[] {
    return this.transactions;
  }

  getTransactionOrder(tx: Transaction): number {
    return this.transactionOrder.get(this.getTransactionHash(tx)) || -1;
  }

  private getTransactionHash(tx: Transaction): string {
    return `${tx.from.address}:${tx.to.address}:${tx.nonce}`;
  }
}