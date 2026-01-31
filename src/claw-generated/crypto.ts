// src/claw-generated/crypto.ts
import * as bip39 from 'bip39';
import * as ed25519 from 'ed25519-hd-key';
import { base58 } from 'base-x';

export function generateKeypair(seed: Buffer): { publicKey: Buffer, privateKey: Buffer } {
  const { publicKey, privateKey } = ed25519.derivePath("m/44'/60'/0'/0/0", seed);
  return { publicKey, privateKey };
}

export function deriveAddress(publicKey: Buffer): string {
  const address = base58.encode(publicKey);
  return address;
}

export function generateSeedPhrase(): string {
  return bip39.generateMnemonic();
}

export function seedFromPhrase(phrase: string): Buffer {
  return bip39.mnemonicToSeedSync(phrase);
}