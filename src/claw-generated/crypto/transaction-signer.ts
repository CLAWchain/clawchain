// src/claw-generated/crypto/transaction-signer.ts

import { ec as EC } from 'elliptic';
import { keccak256 } from 'js-sha3';

export class TransactionSigner {
  private ec: EC;

  constructor() {
    this.ec = new EC('secp256k1');
  }

  /**
   * Sign a transaction using the provided private key.
   * @param transaction - The transaction object to sign.
   * @param privateKey - The private key to use for signing.
   * @returns The signed transaction.
   */
  signTransaction(transaction: any, privateKey: string): any {
    const key = this.ec.keyFromPrivate(privateKey, 'hex');
    const signature = key.sign(this.hashTransaction(transaction));
    return {
      ...transaction,
      signature: {
        r: signature.r.toString(16),
        s: signature.s.toString(16),
        v: signature.recoveryParam
      }
    };
  }

  /**
   * Verify the signature of a signed transaction.
   * @param transaction - The signed transaction to verify.
   * @returns True if the signature is valid, false otherwise.
   */
  verifyTransaction(transaction: any): boolean {
    const { r, s, v } = transaction.signature;
    const key = this.ec.keyFromPublic(this.recoverPublicKey(transaction), 'hex');
    return key.verify(this.hashTransaction(transaction), { r, s });
  }

  private hashTransaction(transaction: any): Buffer {
    return Buffer.from(keccak256(JSON.stringify(transaction)), 'hex');
  }

  private recoverPublicKey(transaction: any): string {
    const { r, s, v } = transaction.signature;
    const key = this.ec.recoverPubKey(
      this.hashTransaction(transaction),
      { r: Buffer.from(r, 'hex'), s: Buffer.from(s, 'hex') },
      v
    );
    return key.toString(16);
  }
}