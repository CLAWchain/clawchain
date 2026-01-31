import { Transaction } from './transaction';
import { NonceTracker } from './nonce-tracker';

export class TransactionManager {
  private nonceTracker: NonceTracker;

  constructor() {
    this.nonceTracker = new NonceTracker();
  }

  processTransaction(transaction: Transaction): boolean {
    if (!transaction.verifySignature(transaction.sender)) {
      return false; // Signature is invalid
    }

    if (!this.nonceTracker.trackNonce(transaction)) {
      return false; // Nonce is not greater than the last one
    }

    // Process the transaction further (e.g., update account balances)
    return true;
  }
}