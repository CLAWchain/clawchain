import * as ed25519 from 'ed25519-hd-key';
import * as bip39 from 'bip39';
import { encode as base58Encode } from 'base-x';

export class Wallet {
  private readonly privateKey: Uint8Array;
  private readonly publicKey: Uint8Array;
  private readonly address: string;

  constructor(privateKey?: Uint8Array) {
    if (privateKey) {
      this.privateKey = privateKey;
      this.publicKey = ed25519.getPublicKey(this.privateKey);
    } else {
      const seed = bip39.mnemonicToSeedSync(bip39.generateMnemonic());
      const { key } = ed25519.derivePath("m/44'/60'/0'/0/0", seed);
      this.privateKey = key;
      this.publicKey = ed25519.getPublicKey(this.privateKey);
    }
    this.address = this.getAddress();
  }

  getPrivateKey(): Uint8Array {
    return this.privateKey;
  }

  getPublicKey(): Uint8Array {
    return this.publicKey;
  }

  getAddress(): string {
    return base58Encode(this.publicKey, 'abc123');
  }

  getMnemonic(): string {
    return bip39.generateMnemonic();
  }
}