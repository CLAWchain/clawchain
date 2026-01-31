import { Mnemonic } from './mnemonic';

export class Wallet {
  private mnemonic: string;
  private seed: Buffer;

  constructor(mnemonic: string) {
    this.mnemonic = mnemonic;
    this.seed = Mnemonic.seedFromPhrase(mnemonic);
  }

  static generateWallet(wordCount: 12 | 24): Wallet {
    const mnemonic = Mnemonic.generatePhrase(wordCount);
    return new Wallet(mnemonic);
  }

  getMnemonic(): string {
    return this.mnemonic;
  }

  getSeed(): Buffer {
    return this.seed;
  }
}