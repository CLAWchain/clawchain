/**
 * Transaction Signing Library
 * 
 * Provides functionality for signing transactions client-side using different signature schemes.
 */

import { Transaction } from '../models/transaction';
import { Wallet } from '../wallet/wallet';
import * as elliptic from 'elliptic';

const ec = new elliptic.ec('secp256k1');

export class TransactionSigner {
  /**
   * Sign a transaction using the provided wallet.
   * @param tx The transaction to sign
   * @param wallet The wallet to use for signing
   * @returns The signed transaction
   */
  static sign(tx: Transaction, wallet: Wallet): Transaction {
    const key = ec.keyFromPrivate(wallet.privateKey, 'hex');
    const signature = key.sign(tx.hash()).toDER('hex');
    tx.signature = signature;
    return tx;
  }

  /**
   * Verify the signature of a transaction.
   * @param tx The transaction to verify
   * @returns True if the signature is valid, false otherwise
   */
  static verify(tx: Transaction): boolean {
    const key = ec.keyFromPublic(tx.senderPublicKey, 'hex');
    return key.verify(tx.hash(), tx.signature);
  }
}