import { Transaction } from './transaction';
import { Account } from '../account/account';
import { EventBus } from '../EventBus';
import { Crypto } from '../crypto/index';

export class TransactionValidator {
  private static nonceTracker: Map<string, number> = new Map();
  private static MAX_NONCE: number = Number.MAX_SAFE_INTEGER;
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  validateTransaction(transaction: Transaction, account: Account): boolean {
    // Verify the transaction signature
    if (!this.verifyTransactionSignature(transaction, account)) {
      this.eventBus.emit('invalid_transaction', transaction);
      return false;
    }

    // Verify the transaction nonce
    if (!this.verifyTransactionNonce(transaction, account)) {
      this.eventBus.emit('invalid_transaction', transaction);
      return false;
    }

    // Check for integer overflows
    if (this.checkForIntegerOverflows(transaction)) {
      this.eventBus.emit('invalid_transaction', transaction);
      return false;
    }

    // Other validation checks...

    return true;
  }

  private verifyTransactionSignature(transaction: Transaction, account: Account): boolean {
    // Implement signature verification logic here
    return Crypto.verifySignature(
      transaction.signature,
      transaction.toSignableData(),
      account.publicKey
    );
  }

  private verifyTransactionNonce(transaction: Transaction, account: Account): boolean {
    const accountAddress = account.address;
    const lastNonce = this.nonceTracker.get(accountAddress) || 0;

    if (transaction.nonce <= lastNonce || transaction.nonce > this.MAX_NONCE) {
      return false;
    }

    this.nonceTracker.set(accountAddress, transaction.nonce);
    return true;
  }

  private checkForIntegerOverflows(transaction: Transaction): boolean {
    // Check for integer overflows in the transaction nonce and other numeric values
    if (transaction.nonce > this.MAX_NONCE) {
      return true;
    }

    // Add more checks for other numeric fields

    return false;
  }
}