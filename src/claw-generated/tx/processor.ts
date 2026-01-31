import { Account } from '../state/account';
import { EventBus } from '../EventBus';
import { Transaction } from '../transaction/transaction';

export class TxnProcessor {
  private accounts: Account[];
  private eventBus: EventBus;

  constructor(accounts: Account[], eventBus: EventBus) {
    this.accounts = accounts;
    this.eventBus = eventBus;
  }

  processTransaction(tx: Transaction): void {
    // Implement transaction processing logic here
    // Update account states based on the transaction

    // Emit events for new transaction and confirmation
    this.eventBus.emit('new_transaction', tx);

    // TODO: Implement transaction confirmation logic
    // Once a transaction is confirmed, emit 'transaction_confirmed' event
  }
}