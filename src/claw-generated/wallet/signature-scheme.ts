// src/claw-generated/wallet/signature-scheme.ts
import { Transaction } from '../core/transaction';

export type Signature = Uint8Array;

export interface SignatureScheme {
  sign(transaction: Transaction, privateKey: Uint8Array): Signature;
  verify(transaction: Transaction, signature: Signature, publicKey: Uint8Array): boolean;
}

export class ECDSASignatureScheme implements SignatureScheme {
  sign(transaction: Transaction, privateKey: Uint8Array): Signature {
    // Implement ECDSA signing logic here
  }

  verify(transaction: Transaction, signature: Signature, publicKey: Uint8Array): boolean {
    // Implement ECDSA signature verification logic here
  }
}