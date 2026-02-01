import { Transaction } from './transaction';
import { NonceTracker } from './nonce-tracker';

export class TransactionProcessor {
  private nonceTracker: NonceTracker = new NonceTracker();

  processTransaction(tx: Transaction): boolean {
    if (!tx.validate()) {
      return false; // Transaction is invalid
    }

    if (!this.nonceTracker.addTransaction(tx)) {
      return false; // Nonce is not greater than the last one
    }

    // Process the transaction (e.g., update balances)
    // ...

    return true;
  }

  resetNonce(address: string): void {
    this.nonceTracker.resetNonce(address);
  }
}