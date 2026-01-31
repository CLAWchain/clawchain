import { Mnemonic } from './mnemonic';

export class Wallet {
  generateMnemonic(wordCount: 12 | 24): string {
    return Mnemonic.generateMnemonic(wordCount);
  }

  validateMnemonic(mnemonic: string): boolean {
    return Mnemonic.validateMnemonic(mnemonic);
  }
}