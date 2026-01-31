import { Transaction } from '../core/Transaction';
import { KeyPair } from './KeyPair';
import { Signature } from './Signature';

export class TransactionSigner {
  /**
   * Sign a transaction using the provided private key.
   * @param transaction The transaction to sign
   * @param keyPair The key pair to use for signing
   * @returns The signed transaction
   */
  static sign(transaction: Transaction, keyPair: KeyPair): Transaction {
    // Serialize the transaction
    const serializedTx = transaction.serialize();

    // Sign the serialized transaction
    const signature = keyPair.sign(serializedTx);

    // Attach the signature to the transaction
    return transaction.withSignature(signature);
  }

  /**
   * Verify the signature of a signed transaction.
   * @param transaction The signed transaction to verify
   * @returns True if the signature is valid, false otherwise
   */
  static verify(transaction: Transaction): boolean {
    // Serialize the transaction
    const serializedTx = transaction.serialize();

    // Get the signature from the transaction
    const signature = transaction.signature;

    // Verify the signature using the public key
    return transaction.senderPublicKey.verify(serializedTx, signature);
  }
}