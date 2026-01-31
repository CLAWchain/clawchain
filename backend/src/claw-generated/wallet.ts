import * as crypto from 'crypto';
import { mnemonicToSeedSync } from 'bip39';
import { Ed25519KeyPair } from 'js-crypto-ed25519';
import { base58 } from 'multiformats/bases/base58';

export class Wallet {
  private keyPair: Ed25519KeyPair;

  constructor(seed?: Uint8Array) {
    if (seed) {
      this.keyPair = Ed25519KeyPair.fromSeed(seed);
    } else {
      this.keyPair = Ed25519KeyPair.generate();
    }
  }

  get publicKey(): Uint8Array {
    return this.keyPair.publicKey;
  }

  get privateKey(): Uint8Array {
    return this.keyPair.privateKey;
  }

  get address(): string {
    return base58.encode(this.publicKey);
  }

  get seedPhrase(): string {
    const seed = this.keyPair.seed;
    return bip39.entropyToMnemonic(seed);
  }

  static fromSeedPhrase(seedPhrase: string): Wallet {
    const seed = mnemonicToSeedSync(seedPhrase);
    return new Wallet(seed);
  }
}