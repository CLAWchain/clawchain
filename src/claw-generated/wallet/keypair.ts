import { Ed25519KeyPair } from 'crypto-types';

export class WalletKeypair {
  private keypair: Ed25519KeyPair;

  constructor() {
    this.keypair = Ed25519KeyPair.generate();
  }

  get publicKey(): Uint8Array {
    return this.keypair.publicKey;
  }

  get privateKey(): Uint8Array {
    return this.keypair.privateKey;
  }

  sign(message: Uint8Array): Uint8Array {
    return this.keypair.sign(message);
  }
}