import { Ed25519KeyPair } from 'crypto';

export class Wallet {
  private keyPair: Ed25519KeyPair;

  constructor() {
    this.keyPair = Ed25519KeyPair.generate();
  }

  getPublicKey(): Buffer {
    return this.keyPair.publicKey;
  }

  getPrivateKey(): Buffer {
    return this.keyPair.privateKey;
  }
}