// src/claw-generated/signing/ed25519.ts

import { Transaction, SignedTransaction } from './types';
import { sign, verify } from 'tweetnacl';

export function signEd25519(
  transaction: Transaction,
  privateKey: Uint8Array
): SignedTransaction {
  const signature = sign.detached(
    Buffer.from(JSON.stringify(transaction)),
    privateKey
  );
  return {
    ...transaction,
    signature: Buffer.from(signature),
  };
}

export function verifyEd25519(
  signedTransaction: SignedTransaction,
  publicKey: Uint8Array
): boolean {
  return verify.detached(
    Buffer.from(JSON.stringify(signedTransaction)),
    signedTransaction.signature,
    publicKey
  );
}