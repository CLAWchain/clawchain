// src/claw-generated/wallet/signing.ts

import { createECDSASignature, verifyECDSASignature } from '../crypto';
import { createEd25519Signature, verifyEd25519Signature } from '../crypto';

export const secp256k1 = {
  sign: (privateKey: Buffer, data: Buffer): Buffer => {
    return createECDSASignature(privateKey, data);
  },
  verify: (publicKey: Buffer, signature: Buffer, data: Buffer): boolean => {
    return verifyECDSASignature(publicKey, signature, data);
  }
};

export const ed25519 = {
  sign: (privateKey: Buffer, data: Buffer): Buffer => {
    return createEd25519Signature(privateKey, data);
  },
  verify: (publicKey: Buffer, signature: Buffer, data: Buffer): boolean => {
    return verifyEd25519Signature(publicKey, signature, data);
  }
};