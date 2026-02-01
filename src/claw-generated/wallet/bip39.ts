// src/claw-generated/wallet/bip39.ts

import * as bip39 from 'bip39';

export function generateMnemonic(): string {
  return bip39.generateMnemonic();
}

export function mnemonicToSeedSync(mnemonic: string): Uint8Array {
  return bip39.mnemonicToSeedSync(mnemonic);
}