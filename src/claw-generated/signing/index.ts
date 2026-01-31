// src/claw-generated/signing/index.ts

import { SignatureScheme, Transaction, SignedTransaction } from './types';
import { signECDSA, verifyECDSA } from './ecdsa';
import { signEd25519, verifyEd25519 } from './ed25519';

export class TransactionSigner {
  static sign(
    transaction: Transaction,
    privateKey: Uint8Array,
    scheme: SignatureScheme
  ): SignedTransaction {
    switch (scheme) {
      case 'ecdsa':
        return signECDSA(transaction, privateKey);
      case 'ed25519':
        return signEd25519(transaction, privateKey);
      default:
        throw new Error(`Unsupported signature scheme: ${scheme}`);
    }
  }

  static verify(
    signedTransaction: SignedTransaction,
    publicKey: Uint8Array,
    scheme: SignatureScheme
  ): boolean {
    switch (scheme) {
      case 'ecdsa':
        return verifyECDSA(signedTransaction, publicKey);
      case 'ed25519':
        return verifyEd25519(signedTransaction, publicKey);
      default:
        throw new Error(`Unsupported signature scheme: ${scheme}`);
    }
  }
}