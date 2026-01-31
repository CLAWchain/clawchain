import * as nacl from 'tweetnacl';

export function generateKeyPair(): { publicKey: Uint8Array; secretKey: Uint8Array } {
  return nacl.sign.keyPair();
}

export function deriveAddress(publicKey: Uint8Array): string {
  // Implement base58 encoding of public key
  // Return the address string
}