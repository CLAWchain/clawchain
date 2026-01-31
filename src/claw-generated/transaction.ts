import { Account } from '../account/account';

export interface Transaction {
  from: Account;
  to: Account;
  value: number;
  nonce: number;
  signature: string;
}

export class TransactionManager {
  private nonceTracker: Map<string, number> = new Map();

  processTransaction(tx: Transaction): boolean {
    const { from, nonce } = tx;
    const lastNonce = this.nonceTracker.get(from.address) || 0;

    if (nonce <= lastNonce) {
      // Nonce is not greater than the last one, reject the transaction
      return false;
    }

    // Update the nonce tracker
    this.nonceTracker.set(from.address, nonce);

    // Process the transaction
    // ...

    return true;
  }
}