import { Ed25519Signature } from './crypto';

export class Transaction {
  public readonly id: string;
  public readonly from: string;
  public readonly to: string;
  public readonly amount: number;
  public readonly signature: Ed25519Signature;

  constructor(from: string, to: string, amount: number, signature: Ed25519Signature) {
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.signature = signature;
    this.id = this.computeId();
  }

  private computeId(): string {
    // Implement transaction ID computation
    return `${this.from}-${this.to}-${this.amount}`;
  }

  verifySignature(publicKey: Uint8Array): boolean {
    // Verify the transaction signature using the provided public key
    return this.signature.verify(publicKey, this.computeId().getBytes());
  }
}