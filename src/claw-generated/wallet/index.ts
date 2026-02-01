import { Ed25519KeyPair } from './keypair';

export class Wallet {
  private keyPair: Ed25519KeyPair;

  constructor() {
    this.keyPair = new Ed25519KeyPair();
  }

  getPublicKey(): Uint8Array {
    return this.keyPair.publicKey;
  }

  getPrivateKey(): Uint8Array {
    return this.keyPair.privateKey;
  }
}