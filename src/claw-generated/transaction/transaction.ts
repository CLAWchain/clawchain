import { Account } from '../account/account';
import { TransactionValidator } from './transaction-validation';
import * as crypto from 'crypto';

export interface Transaction {
  from: Account;
  to: Account;
  amount: number;
  nonce: number;
  signatures: string[];
}

export class TransactionManager {
  static createTransaction(from: Account, to: Account, amount: number, nonce: number): Transaction {
    return {
      from,
      to,
      amount,
      nonce,
      signatures: []
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

    // Add the signature to the transaction
    transaction.signatures.push(signature);
    return transaction;
  }

  static verifyTransaction(transaction: Transaction, account: Account): boolean {
    return TransactionValidator.validateTransaction(transaction, account);
  }

  static verifyMultiSignatures(transaction: Transaction, publicKeys: string[], signatures: string[]): boolean {
    // Verify that the number of signatures matches the number of public keys
    if (signatures.length !== publicKeys.length) {
      return false;
    }

    // Hash the transaction data
    const transactionData = JSON.stringify({
      from: transaction.from.address,
      to: transaction.to.address,
      amount: transaction.amount,
      nonce: transaction.nonce
    });
    const hash = crypto.createHash('sha256').update(transactionData).digest('hex');

    // Verify each signature against the corresponding public key
    for (let i = 0; i < signatures.length; i++) {
      const publicKey = publicKeys[i];
      const signature = signatures[i];

      const verifier = crypto.createVerify('SHA256');
      verifier.update(hash);
      if (!verifier.verify(publicKey, signature, 'hex')) {
        return false;
      }
    }

    return true;
  }
}