import { Transaction } from './transaction';
import { Account } from '../account/account';

export class TransactionValidator {
  static checkIntegerOverflow(transaction: Transaction): boolean {
    // Implement logic to check for integer overflow in the transaction amount
    return transaction.amount <= Number.MAX_SAFE_INTEGER;
  }

  static checkReplayAttack(transaction: Transaction, account: Account): boolean {
    // Implement logic to check for replay attacks by tracking transaction nonces
    return transaction.nonce === account.nextExpectedNonce;
  }

  static checkSignatureMalleability(transaction: Transaction): boolean {
    // Implement logic to check for signature malleability
    // This may involve verifying the signature against the expected format and constraints
    return true;
  }

  static validateTransaction(transaction: Transaction, account: Account): boolean {
    return (
      this.checkIntegerOverflow(transaction) &&
      this.checkReplayAttack(transaction, account) &&
      this.checkSignatureMalleability(transaction)
    );
  }
}