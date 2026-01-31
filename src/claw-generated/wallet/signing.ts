import { Transaction } from '../types';
import { KeyPair } from './keypair';
import { ec as EC } from 'elliptic';

export class TransactionSigner {
  private keyPair: KeyPair;
  private ec: EC;

  constructor(keyPair: KeyPair) {
    this.keyPair = keyPair;
    this.ec = new EC('secp256k1');
  }

  signTransaction(tx: Transaction): Transaction {
    const key = this.ec.keyFromPrivate(this.keyPair.privateKey);
    const signature = key.sign(this.hashTransaction(tx));
    tx.signature = {
      r: signature.r.toString(16),
      s: signature.s.toString(16)
    };
    return tx;
  }

  private hashTransaction(tx: Transaction): Buffer {
    // TODO: Implement transaction hashing logic
    return Buffer.from('');
  }
}