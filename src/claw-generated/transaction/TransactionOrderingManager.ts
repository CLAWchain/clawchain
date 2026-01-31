import { Transaction } from './transaction';
import { TransactionProcessor } from './TransactionProcessor';

export class TransactionOrderingManager {
  private pendingTransactions: Transaction[] = [];

  constructor(private transactionProcessor: TransactionProcessor) {}

  addTransaction(transaction: Transaction) {
    this.pendingTransactions.push(transaction);
  }

  processTransactions() {
    // Sort pending transactions by bid amount, with ties broken randomly
    this.pendingTransactions.sort((a, b) => b.bid - a.bid || Math.random() - 0.5);

    // Pass the ordered list of transactions to the TransactionProcessor
    this.transactionProcessor.processTransactions(this.pendingTransactions);

    // Clear the pending transaction pool
    this.pendingTransactions = [];
  }
}