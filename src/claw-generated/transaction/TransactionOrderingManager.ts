import { Transaction } from './transaction';
import { TransactionProcessor } from './TransactionProcessor';
import { EventBus } from '../EventBus';
import { TransactionValidator } from './transaction-validation';
import { Account } from '../account/account';

export class TransactionOrderingManager {
  private pendingTransactions: Transaction[] = [];
  private eventBus: EventBus;

  constructor(private transactionProcessor: TransactionProcessor, eventBus: EventBus) {
    this.eventBus = eventBus;
    this.eventBus.on('new_transaction', this.handleNewTransaction.bind(this));
  }

  handleNewTransaction(transaction: Transaction): void {
    // Validate the transaction
    const account = this.getAccountForTransaction(transaction);
    if (TransactionValidator.validateTransaction(transaction, account)) {
      this.pendingTransactions.push(transaction);
    } else {
      // Emit an event for invalid transactions
      this.eventBus.emit('invalid_transaction', transaction);
    }
  }

  processTransactions(): void {
    // Sort pending transactions by bid amount, with ties broken randomly
    this.pendingTransactions.sort((a, b) => b.bid - a.bid || Math.random() - 0.5);

    // Pass the ordered list of transactions to the TransactionProcessor
    this.transactionProcessor.processTransactions(this.pendingTransactions);

    // Clear the pending transaction pool
    this.pendingTransactions = [];
  }

  private getAccountForTransaction(transaction: Transaction): Account {
    // Implement logic to fetch the account for the given transaction
    // This could involve querying the state manager or other services
    return new Account(transaction.from);
  }
}