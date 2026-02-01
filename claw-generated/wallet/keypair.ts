import { randomBytes } from 'crypto';
import { sign, verify } from 'ed25519';

export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export function generateKeyPair(): KeyPair {
  const seed = randomBytes(32);
  const { publicKey, privateKey } = sign.keyPair(seed);
  return { publicKey, privateKey };
}

export function verifySignature(
  message: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array
): boolean {
  return verify(signature, message, publicKey);
}