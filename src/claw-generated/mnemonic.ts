import { entropyToMnemonic, mnemonicToEntropy } from 'bip39';
import { randomBytes } from 'crypto';

export class Mnemonic {
  static generateMnemonic(wordCount: 12 | 24): string {
    const entropy = randomBytes(wordCount === 12 ? 16 : 32);
    return entropyToMnemonic(entropy);
  }

  static validateMnemonic(mnemonic: string): boolean {
    try {
      mnemonicToEntropy(mnemonic);
      return true;
    } catch (e) {
      return false;
    }
  }
}