import { randomBytes } from 'crypto';
import { argon2 } from 'argon2-wasm';
import * as nacl from 'tweetnacl';

export interface EncryptedKeypair {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  salt: Uint8Array;
}

export async function generateEncryptedKeypair(password: string): Promise<EncryptedKeypair> {
  const keypair = nacl.sign.keyPair();
  const salt = randomBytes(16);
  const key = await argon2.hash(password, { salt });

  const nonce = randomBytes(nacl.secretbox.nonceLength);
  const ciphertext = nacl.secretbox(keypair.secretKey, nonce, key.hash);

  return {
    ciphertext,
    nonce,
    salt
  };
}

export async function decryptKeypair(encrypted: EncryptedKeypair, password: string): Promise<nacl.SignKeyPair> {
  const key = await argon2.hash(password, { salt: encrypted.salt });
  const secretKey = nacl.secretbox.open(encrypted.ciphertext, encrypted.nonce, key.hash);
  if (!secretKey) {
    throw new Error('Failed to decrypt keypair');
  }
  return {
    publicKey: keypair.publicKey,
    secretKey
  };
}