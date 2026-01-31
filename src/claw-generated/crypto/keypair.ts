import * as ed25519 from 'ed25519-hd-key';
import * as bip39 from 'bip39';
import { base58 } from 'bitcoinjs-lib';

/**
 * Generate a new Ed25519 keypair from a random seed.
 * @returns An object with the private and public keys.
 */
export function generateKeypair(): { privateKey: Uint8Array; publicKey: Uint8Array } {
  const seed = new Uint8Array(32);
  crypto.getRandomValues(seed);
  const { key: privateKey } = ed25519.derivePath("m/44'/60'/0'/0/0", seed.toString());
  const publicKey = ed25519.getPublicKey(privateKey);
  return { privateKey, publicKey };
}

/**
 * Derive an Ed25519 keypair from a BIP39 seed phrase.
 * @param seedPhrase - The BIP39 seed phrase to use.
 * @returns An object with the private and public keys.
 */
export function deriveKeypairFromSeedPhrase(seedPhrase: string): { privateKey: Uint8Array; publicKey: Uint8Array } {
  const seed = bip39.mnemonicToSeedSync(seedPhrase);
  const { key: privateKey } = ed25519.derivePath("m/44'/60'/0'/0/0", seed.toString('hex'));
  const publicKey = ed25519.getPublicKey(privateKey);
  return { privateKey, publicKey };
}

/**
 * Convert an Ed25519 public key to a base58-encoded address.
 * @param publicKey - The public key to convert.
 * @returns The base58-encoded address.
 */
export function getAddressFromPublicKey(publicKey: Uint8Array): string {
  return base58.encode(publicKey);
}