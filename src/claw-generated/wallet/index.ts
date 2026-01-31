// src/claw-generated/wallet/index.ts

import * as bip39 from 'bip39';
import * as ed25519 from 'ed25519-hd-key';
import * as bs58 from 'bs58';

export class Wallet {
  private _privateKey: Uint8Array;
  private _publicKey: Uint8Array;
  private _address: string;

  constructor(seed: string) {
    this._privateKey = this.derivePrivateKey(seed);
    this._publicKey = this.derivePublicKey(this._privateKey);
    this._address = this.deriveAddress(this._publicKey);
  }

  get privateKey(): Uint8Array {
    return this._privateKey;
  }

  get publicKey(): Uint8Array {
    return this._publicKey;
  }

  get address(): string {
    return this._address;
  }

  private derivePrivateKey(seed: string): Uint8Array {
    const { key } = ed25519.derivePath("m/44'/60'/0'/0/0", seed);
    return key;
  }

  private derivePublicKey(privateKey: Uint8Array): Uint8Array {
    return ed25519.getPublicKey(privateKey);
  }

  private deriveAddress(publicKey: Uint8Array): string {
    return bs58.encode(publicKey);
  }
}