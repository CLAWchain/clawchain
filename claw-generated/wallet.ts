import { PublicKey, Signature, verifySignature, aggregateSignatures } from '@claw/crypto';

export class MultisigWallet {
  private publicKeys: PublicKey[];
  private threshold: number;
  private aggregatedSignature: Signature | null;

  constructor(publicKeys: PublicKey[], threshold: number) {
    this.publicKeys = publicKeys;
    this.threshold = threshold;
    this.aggregatedSignature = null;
  }

  addSignature(signature: Signature): boolean {
    // Add the signature to the aggregated signature
    if (this.aggregatedSignature === null) {
      this.aggregatedSignature = signature;
    } else {
      try {
        this.aggregatedSignature = aggregateSignatures([this.aggregatedSignature, signature]);
      } catch (error) {
        console.error('Error aggregating signature:', error);
        return false;
      }
    }

    // Check if the number of signatures meets the threshold
    if (this.aggregatedSignature !== null && this.publicKeys.length >= this.threshold) {
      return true;
    }

    return false;
  }

  verify(transaction: Transaction): boolean {
    if (this.aggregatedSignature === null) {
      return false;
    }

    try {
      return verifySignature(this.aggregatedSignature, transaction.data, this.publicKeys);
    } catch (error) {
      console.error('Error verifying transaction:', error);
      return false;
    }
  }
}

export class Transaction {
  public data: string;

  constructor(data: string) {
    this.data = data;
  }
}