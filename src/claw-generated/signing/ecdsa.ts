// src/claw-generated/signing/ecdsa.ts

import { Transaction, SignedTransaction } from './types';
import { ec as EC } from 'elliptic';

const secp256k1 = new EC('secp256k1');

export function signECDSA(
  transaction: Transaction,
  privateKey: Uint8Array
): SignedTransaction {
  const key = secp256k1.keyFromPrivate(privateKey);
  const signature = key.sign(Buffer.from(JSON.stringify(transaction)));
  return {
    ...transaction,
    signature: signature.toDER(),
  };
}

export function verifyECDSA(
  signedTransaction: SignedTransaction,
  publicKey: Uint8Array
): boolean {
  const key = secp256k1.keyFromPublic(publicKey);
  return key.verify(
    Buffer.from(JSON.stringify(signedTransaction)),
    signedTransaction.signature
  );
}