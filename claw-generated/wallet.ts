import * as ed25519 from 'ed25519-hd-key';
import * as bip39 from 'bip39';
import * as bs58 from 'bs58';

export class Wallet {
  private readonly privateKey: Uint8Array;
  private readonly publicKey: Uint8Array;
  private readonly address: string;

  constructor(seed: Uint8Array) {
    const { key: privateKey } = ed25519.derivePath("m/44'/60'/0'/0/0", seed);
    this.privateKey = privateKey;
    this.publicKey = ed25519.getPublicKey(privateKey);
    this.address = bs58.encode(this.publicKey);
  }

  getPrivateKey(): Uint8Array {
    return this.privateKey;
  }

  getPublicKey(): Uint8Array {
    return this.publicKey;
  }

  getAddress(): string {
    return this.address;
  }

  static generateFromMnemonic(mnemonic: string): Wallet {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    return new Wallet(seed);
  }
}