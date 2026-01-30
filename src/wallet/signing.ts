// Transaction Signing Library
import { Transaction } from '../core/transaction';
import { Wallet } from './wallet';
import { keccak256 } from 'js-sha3';
import { ec as EC } from 'elliptic';

const secp256k1 = new EC('secp256k1');

export class Signer {
  /**
   * Sign a transaction using the provided wallet.
   * @param tx - The transaction to sign
   * @param wallet - The wallet instance containing the private key
   * @returns The signed transaction
   */
  static sign(tx: Transaction, wallet: Wallet): Transaction {
    // Hash the transaction data
    const hash = keccak256(tx.serialize());

    // Sign the hash using the wallet's private key
    const key = secp256k1.keyFromPrivate(wallet.privateKey, 'hex');
    const signature = key.sign(hash);

    // Attach the signature to the transaction
    tx.signature = {
      r: signature.r.toString(16),
      s: signature.s.toString(16),
      v: signature.recoveryParam! + 27,
    };

    return tx;
  }

  /**
   * Verify the signature of a transaction.
   * @param tx - The transaction to verify
   * @returns True if the signature is valid, false otherwise
   */
  static verify(tx: Transaction): boolean {
    // Hash the transaction data
    const hash = keccak256(tx.serialize());

    // Recover the public key from the signature
    const key = secp256k1.keyFromPublic(tx.senderAddress, 'hex');
    const signature = {
      r: Buffer.from(tx.signature.r, 'hex'),
      s: Buffer.from(tx.signature.s, 'hex'),
      recoveryParam: tx.signature.v - 27,
    };

    // Verify the signature
    return key.verify(hash, signature);
  }
}