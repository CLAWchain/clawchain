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