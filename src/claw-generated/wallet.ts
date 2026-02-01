import { generateKeyPair } from 'crypto';

export class Wallet {
  private _keyPair: CryptoKeyPair;
  private _nonce: number;

  constructor() {
    this._keyPair = this.generateKeyPair();
    this._nonce = 0;
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

  get nonce(): number {
    return this._nonce;
  }

  incrementNonce(): void {
    this._nonce++;
  }
}