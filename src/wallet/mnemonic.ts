// BIP-39 Mnemonic Phrase Generation

import * as crypto from 'crypto';
import wordlist from './wordlist';

export function generateMnemonic(wordCount: 12 | 24): string[] {
  // Generate random entropy
  const entropy = crypto.randomBytes(wordCount === 12 ? 16 : 32);

  // Convert entropy to mnemonic words
  const words = [];
  for (let i = 0; i < wordCount; i++) {
    const index = (entropy[i >> 2] >> ((i * 8) % 32)) & 0xff;
    words.push(wordlist[index]);
  }

  return words;
}

export function validateMnemonic(mnemonic: string[]): boolean {
  // TODO: Implement mnemonic validation
  return true;
}