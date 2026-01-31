import { Transaction } from './transaction';
import { Account } from '../account/account';

export class TransactionValidator {
  private static nonceTracker: Map<string, number> = new Map();

  static validateTransaction(transaction: Transaction, account: Account): boolean {
    // Verify the transaction signature
    if (!this.verifyTransactionSignature(transaction, account)) {
      return false;
    }

    // Verify the transaction nonce
    if (!this.verifyTransactionNonce(transaction, account)) {
      return false;
    }

    // Other validation checks...

    return true;
  }

  private static verifyTransactionSignature(transaction: Transaction, account: Account): boolean {
    // Implement signature verification logic here
    return true;
  }

  private static verifyTransactionNonce(transaction: Transaction, account: Account): boolean {
    const accountAddress = account.address;
    const lastNonce = this.nonceTracker.get(accountAddress) || 0;

    if (transaction.nonce <= lastNonce) {
      return false;
    }

    this.nonceTracker.set(accountAddress, transaction.nonce);
    return true;
  }
}