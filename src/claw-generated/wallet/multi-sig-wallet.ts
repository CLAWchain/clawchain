import { Account } from '../account/account';
import { Transaction } from '../transaction/transaction';
import { Ed25519Keypair } from '../crypto/ed25519';

export class MultiSigWallet {
  public publicKeys: Ed25519Keypair[];
  public threshold: number;

  constructor(publicKeys: Ed25519Keypair[], threshold: number) {
    this.publicKeys = publicKeys;
    this.threshold = threshold;
  }

  /**
   * Adds a new public key to the multi-sig wallet.
   * @param publicKey The public key to add
   */
  addPublicKey(publicKey: Ed25519Keypair) {
    this.publicKeys.push(publicKey);
  }

  /**
   * Removes a public key from the multi-sig wallet.
   * @param publicKey The public key to remove
   */
  removePublicKey(publicKey: Ed25519Keypair) {
    this.publicKeys = this.publicKeys.filter(key => key !== publicKey);
  }

  /**
   * Changes the threshold for the multi-sig wallet.
   * @param newThreshold The new threshold value
   */
  changeThreshold(newThreshold: number) {
    this.threshold = newThreshold;
  }

  /**
   * Aggregates the provided signatures and checks if the threshold is met.
   * @param transaction The transaction to verify
   * @param signatures The signatures to aggregate
   * @returns True if the threshold is met, false otherwise
   */
  verifySignatures(transaction: Transaction, signatures: string[]): boolean {
    // Verify that the number of signatures meets the threshold
    if (signatures.length < this.threshold) {
      return false;
    }

    // Aggregate the signatures and verify the transaction
    const publicKeys = this.publicKeys.map(key => key.publicKey);
    return transaction.verifyMultiSignatures(publicKeys, signatures);
  }
}