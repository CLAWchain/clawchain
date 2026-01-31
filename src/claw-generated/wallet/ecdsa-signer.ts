import { Transaction } from '../types';
import { KeyPair } from './keypair';
import { Signer } from './signer';
import { ec as EC } from 'elliptic';

class ECDSASigner extends Signer {
  private ec: EC;

  constructor(keyPair: KeyPair) {
    super(keyPair);
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

  protected hashTransaction(tx: Transaction): Buffer {
    // Implement transaction hashing logic for ECDSA
    return Buffer.from('');
  }
}

export { ECDSASigner };