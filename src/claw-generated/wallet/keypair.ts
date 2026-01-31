import { argon2 } from 'argon2-wasm';
import { randomBytes } from 'crypto';

export interface EncryptedKeypair {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
}

export async function encryptKeypair(keypair: Uint8Array, password: string): Promise<EncryptedKeypair> {
  const salt = randomBytes(16);
  const key = await argon2.hash(password, { salt });
  const nonce = randomBytes(12);
  const ciphertext = await argon2.encrypt(keypair, key, { nonce });
  return { ciphertext, nonce };
}

export async function decryptKeypair(encryptedKeypair: EncryptedKeypair, password: string): Promise<Uint8Array> {
  const key = await argon2.hash(password, { salt: encryptedKeypair.nonce });
  return await argon2.decrypt(encryptedKeypair.ciphertext, key, { nonce: encryptedKeypair.nonce });
}