import * as bip39 from './bip39';

export class Wallet {
  /**
   * Generates a new BIP-39 mnemonic phrase.
   * 
   * @param {12 | 24} wordCount - The number of words in the mnemonic
   * @returns {string} The generated mnemonic phrase
   */
  generateMnemonic(wordCount: 12 | 24): string {
    return bip39.generateMnemonic(wordCount);
  }

  /**
   * Validates a BIP-39 mnemonic phrase.
   * 
   * @param {string} mnemonic - The mnemonic phrase to validate
   * @returns {boolean} True if the mnemonic is valid, false otherwise
   */
  validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }
}