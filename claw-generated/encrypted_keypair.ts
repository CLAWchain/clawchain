import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { argon2 } from 'argon2-wasm';
import { getPublicKey as getSecp256k1PublicKey } from '@noble/secp256k1';

// Define the encrypted keypair format
interface EncryptedKeypair {
  encryptedPrivateKey: string;
  publicKey: string;
}

// Generate a new encrypted keypair
export async function generateEncryptedKeypair(password: string): Promise<EncryptedKeypair> {
  // Generate a random private key
  const privateKey = randomBytes(32);

  // Derive an encryption key from the password using argon2
  const encryptionKey = await argon2.hash(password, { hashLength: 32 });

  // Encrypt the private key
  const encryptedPrivateKey = await encryptPrivateKey(privateKey, encryptionKey);

  // Extract the public key
  const publicKey = getPublicKey(privateKey);

  return {
    encryptedPrivateKey,
    publicKey,
  };
}

// Load an existing encrypted keypair
export async function loadEncryptedKeypair(password: string, encryptedKeypair: EncryptedKeypair): Promise<{ privateKey: Uint8Array; publicKey: string }> {
  // Derive the encryption key from the password
  const encryptionKey = await argon2.hash(password, { hashLength: 32 });

  // Decrypt the private key
  const privateKey = await decryptPrivateKey(encryptedKeypair.encryptedPrivateKey, encryptionKey);

  return {
    privateKey,
    publicKey: encryptedKeypair.publicKey,
  };
}

// Encrypt the private key
async function encryptPrivateKey(privateKey: Uint8Array, encryptionKey: Uint8Array): Promise<string> {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(privateKey), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}.${encrypted.toString('base64')}.${tag.toString('base64')}`;
}

// Decrypt the private key
async function decryptPrivateKey(encryptedPrivateKey: string, encryptionKey: Uint8Array): Promise<Uint8Array> {
  const [ivBase64, encryptedBase64, tagBase64] = encryptedPrivateKey.split('.');
  const iv = Buffer.from(ivBase64, 'base64');
  const encrypted = Buffer.from(encryptedBase64, 'base64');
  const tag = Buffer.from(tagBase64, 'base64');

  const decipher = createDecipheriv('aes-256-gcm', encryptionKey, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted);
}

// Extract the public key from the private key
function getPublicKey(privateKey: Uint8Array): string {
  return getSecp256k1PublicKey(privateKey).toString('hex');
}