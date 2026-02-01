import { generateKeyPair } from 'crypto';

export class Wallet {
  private _keyPair: CryptoKeyPair;

  constructor() {
    this._keyPair = this.generateKeyPair();
  }

  generateKeyPair(): CryptoKeyPair {
    const { publicKey, privateKey } = generateKeyPair('ed25519');
    return { publicKey, privateKey };
  }

  get publicKey(): Uint8Array {
    return this._keyPair.publicKey;
  }

  get privateKey(): Uint8Array {
    return this._keyPair.privateKey;
  }
}