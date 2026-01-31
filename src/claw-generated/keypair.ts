import * as ed25519 from 'ed25519-hd-key';
import * as bip39 from 'bip39';
import { base58 } from 'bitcoin-ts';

export class Keypair {
  private _privateKey: Buffer;
  private _publicKey: Buffer;

  constructor(privateKey: Buffer, publicKey: Buffer) {
    this._privateKey = privateKey;
    this._publicKey = publicKey;
  }

  get privateKey(): Buffer {
    return this._privateKey;
  }

  get publicKey(): Buffer {
    return this._publicKey;
  }

  get address(): string {
    return base58.encode(this._publicKey);
  }

  static fromSeedPhrase(seedPhrase: string): Keypair {
    const seed = bip39.mnemonicToSeedSync(seedPhrase);
    const { key: privateKey } = ed25519.derivePath("m/44'/118'/0'/0/0", seed.toString('hex'));
    const publicKey = ed25519.getPublicKey(privateKey);
    return new Keypair(Buffer.from(privateKey, 'hex'), Buffer.from(publicKey, 'hex'));
  }
}