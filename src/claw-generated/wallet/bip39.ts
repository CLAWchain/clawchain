import { pbkdf2Sync, randomBytes } from 'crypto';
import wordlist from './wordlist';

export function generateMnemonic(strength = 128): string {
  const entropy = randomBytes(strength / 8);
  return entropyToMnemonic(entropy);
}

export function entropyToMnemonic(entropy: Uint8Array): string {
  const bits = bytesToBits(entropy);
  const checksumBits = getChecksum(bits);
  const mnemonicBits = bits + checksumBits;
  const mnemonicWords = mnemonicBitsToWordArray(mnemonicBits);
  return mnemonicWords.join(' ');
}

export function mnemonicToEntropy(mnemonic: string): Uint8Array {
  const words = mnemonic.split(' ');
  const bits = wordsToMnemonicBits(words);
  const dividerIndex = bits.length - 32;
  const entropyBits = bits.slice(0, dividerIndex);
  const checksumBits = bits.slice(dividerIndex);

  if (!verifyChecksum(entropyBits, checksumBits)) {
    throw new Error('Invalid mnemonic phrase');
  }

  return bitsToBytes(entropyBits);
}

export function mnemonicToSeedSync(mnemonic: string, password = ''): Uint8Array {
  const seed = pbkdf2Sync(mnemonic, 'mnemonic' + password, 2048, 64, 'sha512');
  return seed;
}

function getChecksum(bits: string): string {
  const checksumLength = bits.length / 32;
  const checksumBits = bits.slice(bits.length - checksumLength);
  return checksumBits;
}

function verifyChecksum(entropyBits: string, checksumBits: string): boolean {
  const newChecksumBits = getChecksum(entropyBits);
  return newChecksumBits === checksumBits;
}

function mnemonicBitsToWordArray(bits: string): string[] {
  const words = [];
  for (let i = 0; i < bits.length; i += 11) {
    const index = parseInt(bits.slice(i, i + 11), 2);
    words.push(wordlist[index]);
  }
  return words;
}

function wordsToMnemonicBits(words: string[]): string {
  let bits = '';
  for (const word of words) {
    const index = wordlist.indexOf(word);
    if (index === -1) {
      throw new Error(`Invalid word in mnemonic: ${word}`);
    }
    bits += index.toString(2).padStart(11, '0');
  }
  return bits;
}

function bytesToBits(bytes: Uint8Array): string {
  let bits = '';
  for (const byte of bytes) {
    bits += byte.toString(2).padStart(8, '0');
  }
  return bits;
}

function bitsToBytes(bits: string): Uint8Array {
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    const byte = parseInt(bits.slice(i, i + 8), 2);
    bytes.push(byte);
  }
  return new Uint8Array(bytes);
}