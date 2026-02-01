import { Ed25519KeyPair } from 'crypto';

export class Wallet {
  private keyPair: Ed25519KeyPair;
  private nonce: number;

  constructor() {
    this.keyPair = Ed25519KeyPair.generate();
    this.nonce = 0;
  }

  getPublicKey(): Buffer {
    return this.keyPair.publicKey;
  }

  getPrivateKey(): Buffer {
    return this.keyPair.privateKey;
  }

  getNonce(): number {
    return this.nonce;
  }

  incrementNonce(): void {
    this.nonce++;
  }
}