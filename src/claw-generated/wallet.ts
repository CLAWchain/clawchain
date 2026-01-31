import { Ed25519KeyPair } from '../crypto/ed25519';
import { Transaction, SignedTransaction } from './transaction';

export class Wallet {
  private keyPair: Ed25519KeyPair;

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
    const signature = this.keyPair.sign(transaction.serialize());
    return { transaction, signature };
  }
}

export interface Transaction {
  serialize(): Uint8Array;
}

export interface SignedTransaction {
  transaction: Transaction;
  signature: Uint8Array;
}