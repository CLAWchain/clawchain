import { generateMnemonic, mnemonicToSeedSync } from 'bip39';

export class Wallet {
  private mnemonic: string;
  private seed: Buffer;

  constructor(wordCount: 12 | 24 = 12) {
    this.mnemonic = generateMnemonic(wordCount * 11);
    this.seed = mnemonicToSeedSync(this.mnemonic);
  }

  getMnemonic(): string {
    return this.mnemonic;
  }

  getSeed(): Buffer {
    return this.seed;
  }
}