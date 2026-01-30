// Transaction Signing Library
import { Transaction } from '../core/transaction';
import { Wallet } from './wallet';
import { keccak256 } from 'js-sha3';
import { ec as EC } from 'elliptic';
import * as ed from 'noble-ed25519';

const secp256k1 = new EC('secp256k1');

export class Signer {
  /**
   * Sign a transaction using the provided wallet.
   * @param tx - The transaction to sign
   * @param wallet - The wallet instance containing the private key
   * @param scheme - The signature scheme to use (default: 'ecdsa')
   * @returns The signed transaction
   */
  static sign(tx: Transaction, wallet: Wallet, scheme: 'ecdsa' | 'eddsa' = 'ecdsa'): Transaction {
    // Hash the transaction data
    const hash = keccak256(tx.serialize());

    if (scheme === 'ecdsa') {
      // Sign the hash using the wallet's private key (ECDSA)
      const key = secp256k1.keyFromPrivate(wallet.privateKey, 'hex');
      const signature = key.sign(hash);

      // Attach the signature to the transaction
      tx.signature = {
        r: signature.r.toString(16),
        s: signature.s.toString(16),
        v: signature.recoveryParam! + 27,
      };
    } else {
      // Sign the hash using the wallet's private key (EdDSA)
      const signature = ed.sign(hash, wallet.privateKey);

      // Attach the signature to the transaction
      tx.signature = {
        r: signature.slice(0, 64).toString('hex'),
        s: signature.slice(64).toString('hex'),
      };
    }

    return tx;
  }

  /**
   * Verify the signature of a transaction.
   * @param tx - The transaction to verify
   * @param scheme - The signature scheme to use (default: 'ecdsa')
   * @returns True if the signature is valid, false otherwise
   */
  static verify(tx: Transaction, scheme: 'ecdsa' | 'eddsa' = 'ecdsa'): boolean {
    // Hash the transaction data
    const hash = keccak256(tx.serialize());

    if (scheme === 'ecdsa') {
      // Recover the public key from the signature (ECDSA)
      const key = secp256k1.keyFromPublic(tx.senderAddress, 'hex');
      const signature = {
        r: Buffer.from(tx.signature.r, 'hex'),
        s: Buffer.from(tx.signature.s, 'hex'),
        recoveryParam: tx.signature.v - 27,
      };

      // Verify the signature
      return key.verify(hash, signature);
    } else {
      // Verify the signature (EdDSA)
      return ed.verify(tx.signature.r + tx.signature.s, hash, tx.senderAddress);
    }
  }
}