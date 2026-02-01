import * as ed25519 from 'ed25519-hd-key';
import bip39 from 'bip39';
import bs58 from 'bs58';

export class Wallet {
  private _privateKey: Uint8Array;
  private _publicKey: Uint8Array;
  private _address: string;

  constructor(privateKey?: Uint8Array) {
    if (privateKey) {
      this._privateKey = privateKey;
      this._publicKey = ed25519.derive(privateKey, 0).key;
    } else {
      const seed = bip39.mnemonicToSeedSync('');
      this._privateKey = ed25519.derivePath(`m/44'/60'/0'/0/0`, seed).key;
      this._publicKey = ed25519.derive(this._privateKey, 0).key;
    }
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