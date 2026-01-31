// src/claw-generated/crypto/ed25519.ts

import * as ed25519 from 'ed25519-hd-key';

export function createEd25519Signature(privateKey: Buffer, data: Buffer): Buffer {
  const signature = ed25519.sign(data, privateKey);
  return Buffer.from(signature);
}

export function verifyEd25519Signature(publicKey: Buffer, signature: Buffer, data: Buffer): boolean {
  return ed25519.verify(data, signature, publicKey);
}