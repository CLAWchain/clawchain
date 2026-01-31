import { Ed25519Signer } from './crypto';

export class Transaction {
  public readonly id: string;
  public readonly from: string;
  public readonly to: string;
  public readonly amount: number;
  public readonly signature: string;

  constructor(from: string, to: string, amount: number, signature: string) {
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.signature = signature;
    this.id = this.computeId();
  }

  private computeId(): string {
    // Implement transaction ID generation logic
    return `tx_${this.from}_${this.to}_${this.amount}`;
  }

  public verifySignature(): boolean {
    return Ed25519Signer.verify(this.from, `${this.from}:${this.to}:${this.amount}`, this.signature);
  }
}