import * as ed25519 from 'ed25519-hd-key';
import * as base58 from 'bs58';

export function generateKeyPair(seed?: Uint8Array): { publicKey: Uint8Array, privateKey: Uint8Array } {
  const { publicKey, privateKey } = ed25519.derivePath("m/44'/60'/0'/0/0", seed || crypto.getRandomValues(new Uint8Array(32)));
  return { publicKey, privateKey };
}

export function deriveAddress(publicKey: Uint8Array): string {
  return base58.encode(publicKey);
}