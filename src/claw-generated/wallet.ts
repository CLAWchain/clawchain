import { randomBytes } from 'crypto';
import * as bip39 from 'bip39';
import * as ed25519 from 'ed25519-hd-key';
import bs58 from 'bs58';

export class Wallet {
  private _privateKey: Uint8Array;
  private _publicKey: Uint8Array;
  private _address: string;

  constructor(seed?: Uint8Array) {
    if (seed) {
      this.initFromSeed(seed);
    } else {
      this.initNew();
    }
  }

  initNew() {
    this._privateKey = randomBytes(32);
    this._publicKey = ed25519.derivePublicKey(this._privateKey);
    this._address = bs58.encode(this._publicKey);
  }

  initFromSeed(seed: Uint8Array) {
    const { key } = ed25519.derivePath("m/44'/60'/0'/0/0", seed);
    this._privateKey = key;
    this._publicKey = ed25519.derivePublicKey(this._privateKey);
    this._address = bs58.encode(this._publicKey);
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
}