// src/claw-generated/crypto/ecdsa.ts

import { ec as EC } from 'elliptic';

const secp256k1 = new EC('secp256k1');

export function createECDSASignature(privateKey: Buffer, data: Buffer): Buffer {
  const key = secp256k1.keyFromPrivate(privateKey);
  const signature = key.sign(data);
  return Buffer.from(signature.toDER());
}

export function verifyECDSASignature(publicKey: Buffer, signature: Buffer, data: Buffer): boolean {
  const key = secp256k1.keyFromPublic(publicKey);
  return key.verify(data, signature);
}