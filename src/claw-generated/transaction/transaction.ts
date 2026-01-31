import { Account } from '../account/account';

export interface Transaction {
  from: Account;
  to: Account;
  amount: number;
  nonce: number;
  signature: string;
}

export class TransactionManager {
  static createTransaction(from: Account, to: Account, amount: number, nonce: number): Transaction {
    return {
      from,
      to,
      amount,
      nonce,
      signature: ''
    };
  }

  static signTransaction(transaction: Transaction, privateKey: string): Transaction {
    // TODO: Implement transaction signing logic
    transaction.signature = 'SIGNED';
    return transaction;
  }

  static verifyTransaction(transaction: Transaction): boolean {
    // TODO: Implement transaction verification logic
    return transaction.signature === 'SIGNED';
  }
}