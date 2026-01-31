import * as bip39 from 'bip39';

export class Mnemonic {
  static generatePhrase(wordCount: 12 | 24): string {
    return bip39.generateMnemonic(wordCount * 11);
  }

  static validatePhrase(phrase: string): boolean {
    return bip39.validateMnemonic(phrase);
  }

  static seedFromPhrase(phrase: string): Buffer {
    return bip39.mnemonicToSeedSync(phrase);
  }
}