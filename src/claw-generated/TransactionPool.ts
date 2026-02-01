import { Transaction } from './transaction';

export class TransactionPool {
  private transactions: Map&lt;string, Transaction&gt; = new Map();

  async addTransaction(transaction: Transaction): Promise&lt;void&gt; {
    this.transactions.set(transaction.signature, transaction);
  }

  async getTransaction(signature: string): Promise&lt;Transaction | undefined&gt; {
    return this.transactions.get(signature);
  }
}