import { Account } from '../account/account';
import { TransactionValidator } from './transaction-validation';
import * as crypto from 'crypto';

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
    // Hash the transaction data
    const transactionData = JSON.stringify({
      from: transaction.from.address,
      to: transaction.to.address,
      amount: transaction.amount,
      nonce: transaction.nonce
    });
    const hash = crypto.createHash('sha256').update(transactionData).digest('hex');

    // Sign the hash with the private key
    const signature = crypto.createSign('SHA256')
      .update(hash)
      .sign(privateKey, 'hex');

    // Update the transaction with the signature
    transaction.signature = signature;
    return transaction;
  }

  static verifyTransaction(transaction: Transaction, account: Account): boolean {
    return TransactionValidator.validateTransaction(transaction, account);
  }
}