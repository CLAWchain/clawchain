import * as bip39 from 'bip39';
import * as ed25519 from 'ed25519-hd-key';
import { base58 } from 'bs58';

export class Wallet {
  private _privateKey: Buffer;
  private _publicKey: Buffer;

  constructor(seed: Buffer) {
    const { key: privateKey } = ed25519.derivePath("m/44'/714'/0'/0/0", seed);
    this._privateKey = privateKey;
    this._publicKey = ed25519.getPublicKey(privateKey);
  }

  get privateKey(): string {
    return base58.encode(this._privateKey);
  }

  get publicKey(): string {
    return base58.encode(this._publicKey);
  }

  get address(): string {
    return base58.encode(this._publicKey.slice(0, 20));
  }

  static generateFromMnemonic(mnemonic: string): Wallet {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    return new Wallet(seed);
  }
}