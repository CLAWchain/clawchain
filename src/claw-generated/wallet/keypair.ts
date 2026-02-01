import * as sodium from 'libsodium-wrappers';

export class Ed25519KeyPair {
  private _publicKey: Uint8Array;
  private _privateKey: Uint8Array;

  constructor() {
    const { publicKey, privateKey } = sodium.crypto_sign_keypair();
    this._publicKey = publicKey;
    this._privateKey = privateKey;
  }

  get publicKey(): Uint8Array {
    return this._publicKey;
  }

  get privateKey(): Uint8Array {
    return this._privateKey;
  }
}