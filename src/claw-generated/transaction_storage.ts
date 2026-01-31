import { Transaction } from '../types/transaction';

export class TransactionStorage {
  private transactions: Transaction[] = [];

  async getSignaturesForAddress(
    address: string,
    limit: number,
    offset: number
  ): Promise<string[]> {
    // Implement logic to fetch transaction signatures for the given address
    // with pagination support (limit and offset)
    const signatures = this.transactions
      .filter((tx) => tx.from === address || tx.to === address)
      .slice(offset, offset + limit)
      .map((tx) => tx.signature);
    return signatures;
  }

  async addTransaction(transaction: Transaction): Promise<void> {
    this.transactions.push(transaction);
  }
}