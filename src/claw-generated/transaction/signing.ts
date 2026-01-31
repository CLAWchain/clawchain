import { PrivateKey, Signature } from 'crypto-types';
import { ec as EC } from 'elliptic';

export interface TransactionSigner {
  sign(privateKey: PrivateKey, data: Uint8Array): Promise<Signature>;
}

export class ECDSASigner implements TransactionSigner {
  private ec: EC;

  constructor() {
    this.ec = new EC('secp256k1');
  }

  async sign(privateKey: PrivateKey, data: Uint8Array): Promise<Signature> {
    const key = this.ec.keyFromPrivate(privateKey);
    const signature = key.sign(data);
    return new Uint8Array([...signature.r.toArray(), ...signature.s.toArray()]);
  }
}

export class Ed25519Signer implements TransactionSigner {
  async sign(privateKey: PrivateKey, data: Uint8Array): Promise<Signature> {
    // Implement Ed25519 signing logic here
    throw new Error('Not implemented');
  }
}