import { Buffer } from 'buffer';
import { ec as EC } from 'elliptic';
import { keccak256 } from 'js-sha3';

export class TransactionSigner {
  private ec: EC;

  constructor() {
    this.ec = new EC('secp256k1');
  }

  /**
   * Sign a transaction using ECDSA.
   * @param privateKey The private key as a Buffer
   * @param transaction The transaction data to sign
   * @returns The signature as an object with r, s, and recoveryBit properties
   */
  signECDSA(privateKey: Buffer, transaction: any): { r: Buffer; s: Buffer; recoveryBit: number } {
    const key = this.ec.keyFromPrivate(privateKey);
    const digest = this.hashTransaction(transaction);
    const signature = key.sign(digest);
    return {
      r: Buffer.from(signature.r.toArray()),
      s: Buffer.from(signature.s.toArray()),
      recoveryBit: signature.recoveryParam!,
    };
  }

  /**
   * Verify a transaction signature using ECDSA.
   * @param publicKey The public key as a Buffer
   * @param signature The signature object with r, s, and recoveryBit properties
   * @param transaction The transaction data to verify
   * @returns True if the signature is valid, false otherwise
   */
  verifyECDSA(publicKey: Buffer, signature: { r: Buffer; s: Buffer; recoveryBit: number }, transaction: any): boolean {
    const key = this.ec.keyFromPublic(publicKey);
    const digest = this.hashTransaction(transaction);
    return key.verify(digest, {
      r: signature.r,
      s: signature.s,
      recoveryParam: signature.recoveryBit,
    });
  }

  private hashTransaction(transaction: any): Buffer {
    return Buffer.from(keccak256(JSON.stringify(transaction)), 'hex');
  }
}