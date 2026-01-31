import { Ed25519KeyPair } from '../crypto/ed25519';
import { Transaction, SignedTransaction } from './transaction';

export class Wallet {
  private keyPair: Ed25519KeyPair;
  private nonce: number = 0;

  constructor() {
    this.keyPair = Ed25519KeyPair.generate();
  }

  getPublicKey(): Uint8Array {
    return this.keyPair.publicKey;
  }

  getPrivateKey(): Uint8Array {
    return this.keyPair.privateKey;
  }

  signTransaction(transaction: Transaction): SignedTransaction {
    // Verify the transaction nonce is greater than the wallet's current nonce
    if (transaction.nonce <= this.nonce) {
      throw new Error('Transaction nonce is not greater than the wallet nonce');
    }

    const signature = this.keyPair.sign(transaction.serialize());
    this.nonce = transaction.nonce;
    return { transaction, signature };
  }
}

export interface Transaction {
  serialize(): Uint8Array;
  nonce: number;
}

export interface SignedTransaction {
  transaction: Transaction;
  signature: Uint8Array;
}