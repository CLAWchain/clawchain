import { Account } from '../account/account';

export class MultiSigWallet {
  public publicKeys: Account[];
  public threshold: number;

  constructor(publicKeys: Account[], threshold: number) {
    this.publicKeys = publicKeys;
    this.threshold = threshold;
  }

  /**
   * Adds a new public key to the multi-sig wallet.
   * @param publicKey The public key to add
   */
  addPublicKey(publicKey: Account) {
    this.publicKeys.push(publicKey);
  }

  /**
   * Removes a public key from the multi-sig wallet.
   * @param publicKey The public key to remove
   */
  removePublicKey(publicKey: Account) {
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
   * @param signatures The signatures to aggregate
   * @returns True if the threshold is met, false otherwise
   */
  verifySignatures(signatures: string[]): boolean {
    // TODO: Implement signature aggregation and verification logic
    return signatures.length >= this.threshold;
  }
}