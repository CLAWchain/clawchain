import { Transaction } from './transaction';
import { EventEmitter } from 'events';

export class TransactionPool extends EventEmitter {
  private transactions: Map<string, Transaction> = new Map();

  async addTransaction(transaction: Transaction): Promise<void> {
    this.transactions.set(transaction.signature, transaction);
    this.emit('transactionAdded', transaction);
  }

  async confirmTransaction(signature: string): Promise<void> {
    if (this.transactions.has(signature)) {
      const transaction = this.transactions.get(signature)!;
      this.transactions.delete(signature);
      this.emit('transactionConfirmed', transaction);
    }
  }

  async getTransaction(signature: string): Promise<Transaction | undefined> {
    return this.transactions.get(signature);
  }
}