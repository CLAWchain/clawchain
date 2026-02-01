// src/claw-generated/wallet/crypto.ts

import * as sodium from 'libsodium-wrappers';

export async function generateKeyPair(seed?: Uint8Array): Promise<{ publicKey: Uint8Array; privateKey: Uint8Array }> {
  await sodium.ready;
  if (seed) {
    return sodium.crypto_sign_seed_keypair(seed);
  } else {
    return sodium.crypto_sign_keypair();
  }
}

export function deriveAddress(publicKey: Uint8Array): string {
  await sodium.ready;
  const address = sodium.to_base58(publicKey);
  return address;
}

export function verifySignature(message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): boolean {
  await sodium.ready;
  try {
    return sodium.crypto_sign_verify_detached(signature, message, publicKey);
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}