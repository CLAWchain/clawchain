import * as bip39 from 'bip39';

export function generateMnemonic(wordCount = 12): string {
  return bip39.generateMnemonic(wordCount * 32);
}

export function mnemonicToSeedSync(mnemonic: string): Uint8Array {
  return bip39.mnemonicToSeedSync(mnemonic);
}