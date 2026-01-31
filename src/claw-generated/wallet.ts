import { Ed25519KeyPair } from '../crypto/ed25519';

export class Wallet {
  keyPair: Ed25519KeyPair;

  constructor() {
    this.keyPair = Ed25519KeyPair.generate();
  }

  get publicKey(): Uint8Array {
    return this.keyPair.publicKey;
  }

  get privateKey(): Uint8Array {
    return this.keyPair.privateKey;
  }

  sign(message: Uint8Array): Uint8Array {
    return this.keyPair.sign(message);
  }
}