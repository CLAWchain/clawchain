import { KeyPair } from './keyPair';
import * as crypto from 'crypto';

export class TransactionSigner {
  private keyPair: KeyPair;

  constructor(keyPair: KeyPair) {
    this.keyPair = keyPair;
  }

  /**
   * Signs a transaction using the signer's private key.
   * @param transaction - The transaction to sign.
   * @param signatureScheme - The signature scheme to use (e.g., 'ECDSA', 'EdDSA').
   * @returns The signed transaction.
   */
  signTransaction(transaction: any, signatureScheme: string): any {
    switch (signatureScheme) {
      case 'ECDSA':
        return this.signWithECDSA(transaction);
      case 'EdDSA':
        return this.signWithEdDSA(transaction);
      default:
        throw new Error(`Unsupported signature scheme: ${signatureScheme}`);
    }
  }

  /**
   * Signs a transaction using ECDSA.
   * @param transaction - The transaction to sign.
   * @returns The signed transaction.
   */
  private signWithECDSA(transaction: any): any {
    const transactionHash = this.hashTransaction(transaction);
    const signature = crypto.sign('sha256', transactionHash, this.keyPair.privateKey);
    return { ...transaction, signature: signature.toString('hex') };
  }

  /**
   * Signs a transaction using EdDSA.
   * @param transaction - The transaction to sign.
   * @returns The signed transaction.
   */
  private signWithEdDSA(transaction: any): any {
    // TODO: Implement EdDSA signing logic
    return transaction;
  }

  /**
   * Hashes a transaction using SHA-256.
   * @param transaction - The transaction to hash.
   * @returns The hash of the transaction.
   */
  private hashTransaction(transaction: any): Buffer {
    return crypto.createHash('sha256').update(JSON.stringify(transaction)).digest();
  }
}