// src/claw-generated/crypto/ed25519.ts

import * as ed25519 from 'noble-ed25519';

export function verifyEd25519Signature(
  data: Buffer,
  publicKey: Uint8Array,
  signature: Uint8Array
): boolean {
  return ed25519.verify(signature, data, publicKey);
}

export function signEd25519(
  data: Buffer,
  privateKey: Uint8Array
): Uint8Array {
  return ed25519.sign(data, privateKey);
}