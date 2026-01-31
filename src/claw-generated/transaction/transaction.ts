import { Account } from '../account/account';
import { TransactionValidator } from './transaction-validation';
import { verifyEd25519Signature } from '../crypto/ed25519';

export interface Transaction {
  from: Account;
  to: Account;
  amount: number;
  nonce: number;
  signature: string;
  publicKey: Uint8Array;
}

export class TransactionManager {
  static createTransaction(from: Account, to: Account, amount: number, nonce: number): Transaction {
    return {
      from,
      to,
      amount,
      nonce,
      signature: '',
      publicKey: from.publicKey
    };
  }

  static signTransaction(transaction: Transaction, privateKey: Uint8Array): Transaction {
    const transactionData = this.hashTransaction(transaction);
    const signature = this.signEd25519(transactionData, privateKey);
    return {
      ...transaction,
      signature: Buffer.from(signature).toString('hex')
    };
  }

  static validateTransactionNonce(transaction: Transaction, account: Account): boolean {
    return transaction.nonce === account.nonce;
  }

  private static hashTransaction(transaction: Transaction): Buffer {
    return Buffer.from(
      JSON.stringify({
        from: transaction.from.address,
        to: transaction.to.address,
        amount: transaction.amount,
        nonce: transaction.nonce
      })
    );
  }

  private static signEd25519(data: Buffer, privateKey: Uint8Array): Uint8Array {
    return ed25519.sign(data, privateKey);
  }
}