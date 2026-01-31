import { Ed25519 } from 'crypto-js/ed25519';

export class Transaction {
  constructor(
    public readonly from: string,
    public readonly to: string,
    public readonly amount: number,
    public readonly nonce: number,
    public readonly signature: string
  ) {}

  serialize(): string {
    // Serialize the transaction data into a compact, efficient format
    return JSON.stringify({
      from: this.from,
      to: this.to,
      amount: this.amount,
      nonce: this.nonce
    });
  }

  verify(): boolean {
    // Verify the transaction signature using the Ed25519 algorithm
    return Ed25519.verify(this.serialize(), this.signature, this.from);
  }

  sign(privateKey: string): void {
    // Sign the transaction using the Ed25519 algorithm
    this.signature = Ed25519.sign(this.serialize(), privateKey);
  }
}