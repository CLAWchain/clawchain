// src/claw-generated/wallet/transaction-signer.ts
import { Transaction } from '../core/transaction';
import { Signature, SignatureScheme } from './signature-scheme';

export class TransactionSigner {
  private signatureScheme: SignatureScheme;

  constructor(signatureScheme: SignatureScheme) {
    this.signatureScheme = signatureScheme;
  }

  signTransaction(transaction: Transaction, privateKey: Uint8Array): Signature {
    return this.signatureScheme.sign(transaction, privateKey);
  }

  verifySignature(transaction: Transaction, signature: Signature): boolean {
    // Fetch the public key from the transaction
    const publicKey = transaction.senderPublicKey;
    return this.signatureScheme.verify(transaction, signature, publicKey);
  }
}