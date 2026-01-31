import { EventBus } from '../EventBus';
import { Transaction } from './transaction';

export class TransactionFeedManager {
  private eventBus: EventBus;
  private unconfirmedTransactions: Transaction[] = [];
  private confirmedTransactions: Transaction[] = [];

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.eventBus.on('new_transaction', this.handleNewTransaction.bind(this));
    this.eventBus.on('transaction_confirmed', this.handleTransactionConfirmation.bind(this));
  }

  handleNewTransaction(tx: Transaction): void {
    this.unconfirmedTransactions.push(tx);
  }

  handleTransactionConfirmation(tx: Transaction): void {
    // Remove the transaction from the unconfirmed queue
    this.unconfirmedTransactions = this.unconfirmedTransactions.filter(t => t !== tx);

    // Add the transaction to the confirmed queue
    this.confirmedTransactions.push(tx);
  }

  getLatestTransactions(limit: number = 10): { unconfirmed: Transaction[]; confirmed: Transaction[] } {
    return {
      unconfirmed: this.unconfirmedTransactions.slice(0, limit),
      confirmed: this.confirmedTransactions.slice(0, limit)
    };
  }
}