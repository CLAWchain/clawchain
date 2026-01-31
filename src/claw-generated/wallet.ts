import { KeyPair, createKeyPair, sign as ed25519Sign } from 'crypto';
import { Transaction, TransactionInput, TransactionOutput, SignedTransaction } from './transaction';

export class Wallet {
  private _keypair: KeyPair;

  constructor() {
    this._keypair = this.generateKeyPair();
  }

  generateKeyPair(): KeyPair {
    const { publicKey, privateKey } = createKeyPair('ed25519');
    return { publicKey, privateKey };
  }

  get publicKey(): Buffer {
    return this._keypair.publicKey;
  }

  get privateKey(): Buffer {
    return this._keypair.privateKey;
  }

  signTransaction(transaction: Transaction): SignedTransaction {
    const signature = this.sign(transaction.serialize(), this.privateKey);
    return { transaction, signature };
  }

  private sign(data: Buffer, privateKey: Buffer): Buffer {
    return ed25519Sign(data, null, 'ed25519', privateKey);
  }
}

export interface SignedTransaction {
  transaction: Transaction;
  signature: Buffer;
}