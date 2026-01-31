import { PublicKey, Signature, verifySignature } from '../crypto';
import { MultisigWallet } from './multisig_wallet';

export interface Transaction {
  from: PublicKey;
  to: PublicKey;
  value: number;
  data?: string;
  nonce: number;
  signatures: Signature[];
  multisigWallet?: MultisigWallet;
}

export class TransactionManager {
  private transactions: Transaction[] = [];

  addTransaction(transaction: Transaction): void {
    this.transactions.push(transaction);
  }

  getTransactions(): Transaction[] {
    return this.transactions;
  }

  verifyTransaction(transaction: Transaction): boolean {
    if (transaction.multisigWallet) {
      const { owners, threshold } = transaction.multisigWallet;
      let validSignatures = 0;

      for (const signature of transaction.signatures) {
        for (const owner of owners) {
          if (verifySignature(signature, transaction, owner)) {
            validSignatures++;
            break;
          }
        }
      }

      return validSignatures >= threshold;
    } else {
      // Verify single-signature transaction
      return verifySignature(transaction.signatures[0], transaction, transaction.from);
    }
  }
}