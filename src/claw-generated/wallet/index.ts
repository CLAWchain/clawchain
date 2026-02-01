// src/claw-generated/wallet/index.ts

import { generateKeyPair, deriveAddress } from './crypto';
import { generateMnemonic, mnemonicToSeedSync } from './bip39';

export class Wallet {
  private readonly keypair: { publicKey: Uint8Array; privateKey: Uint8Array };
  private readonly seedPhrase: string;

  constructor(seedPhrase?: string) {
    if (seedPhrase) {
      this.seedPhrase = seedPhrase;
      this.keypair = this.getKeypairFromSeedPhrase(seedPhrase);
    } else {
      this.seedPhrase = generateMnemonic();
      this.keypair = generateKeyPair();
    }
  }

  getPublicKey(): Uint8Array {
    return this.keypair.publicKey;
  }

  getPrivateKey(): Uint8Array {
    return this.keypair.privateKey;
  }

  getAddress(): string {
    return deriveAddress(this.keypair.publicKey);
  }

  getSeedPhrase(): string {
    return this.seedPhrase;
  }

  private getKeypairFromSeedPhrase(seedPhrase: string): { publicKey: Uint8Array; privateKey: Uint8Array } {
    const seed = mnemonicToSeedSync(seedPhrase);
    return generateKeyPair(seed);
  }
}