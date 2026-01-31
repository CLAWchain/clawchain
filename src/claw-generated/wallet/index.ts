// src/claw-generated/wallet/index.ts
import * as bip39 from 'bip39';
import * as ed25519 from 'ed25519-hd-key';
import * as base58 from 'bs58';

export class Wallet {
  private _privateKey: Buffer;
  private _publicKey: Buffer;
  private _address: string;

  constructor(privateKey: Buffer) {
    this._privateKey = privateKey;
    this._publicKey = this.derivePublicKey();
    this._address = this.deriveAddress();
  }

  get privateKey(): Buffer {
    return this._privateKey;
  }

  get publicKey(): Buffer {
    return this._publicKey;
  }

  get address(): string {
    return this._address;
  }

  private derivePublicKey(): Buffer {
    return ed25519.derive(this._privateKey, 0).publicKey;
  }

  private deriveAddress(): string {
    return base58.encode(this._publicKey);
  }

  static generateFromSeed(seed: Buffer): Wallet {
    const { key } = ed25519.derivePath("m/44'/60'/0'/0/0", seed);
    return new Wallet(key);
  }

  static generateRandomWallet(): Wallet {
    const mnemonic = bip39.generateMnemonic();
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    return Wallet.generateFromSeed(seed);
  }
}