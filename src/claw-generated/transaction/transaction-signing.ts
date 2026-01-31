import { Transaction } from './transaction';
import { Account } from '../account/account';

export class TransactionSigner {
  static signTransaction(transaction: Transaction, account: Account): void {
    // Implement transaction signing logic here
  }

  static verifyTransactionSignature(transaction: Transaction, account: Account): boolean {
    // Implement transaction signature verification logic here
    return true;
  }
}