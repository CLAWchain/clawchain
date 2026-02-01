import { Wallet } from './wallet';

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  signature: Uint8Array;
}

export class TransactionProcessor {
  static validateTransaction(tx: Transaction, wallet: Wallet): boolean {
    try {
      const publicKey = wallet.publicKey;
      return wallet.verifySignature(tx.signature, tx.id, publicKey);
    } catch (error) {
      console.error('Error verifying transaction signature:', error);
      return false;
    }
  }

  static addToMempool(tx: Transaction): void {
    if (this.validateTransaction(tx, new Wallet())) {
      // Add transaction to the mempool
    } else {
      throw new Error('Invalid transaction signature');
    }
  }

  static includeInBlock(tx: Transaction): void {
    if (this.validateTransaction(tx, new Wallet())) {
      // Include transaction in a new block
    } else {
      throw new Error('Invalid transaction signature');
    }
  }
}