import { generateRandomBytes } from '../crypto';
import { mnemonicToEntropy, entropyToMnemonic } from 'bip39';

export class Wallet {
  private seed: Uint8Array;

  constructor(entropyBits: number = 128) {
    this.seed = generateRandomBytes(entropyBits / 8);
  }

  generateMnemonic(wordCount: 12 | 24 = 12): string {
    const entropy = this.seed.slice(0, wordCount / 6);
    return entropyToMnemonic(entropy);
  }

  validateMnemonic(mnemonic: string): boolean {
    try {
      mnemonicToEntropy(mnemonic);
      return true;
    } catch {
      return false;
    }
  }

  deriveSeedFromMnemonic(mnemonic: string): Uint8Array {
    const entropy = mnemonicToEntropy(mnemonic);
    return new Uint8Array(entropy);
  }
}