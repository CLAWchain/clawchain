import { Ed25519Signature } from './signature';

export class Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  signature: Ed25519Signature;

  constructor(from: string, to: string, amount: number, signature: Ed25519Signature) {
    this.id = this.generateTransactionId();
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.signature = signature;
  }

  private generateTransactionId(): string {
    // Implement transaction ID generation logic
    return `tx-${Math.random().toString(36).substring(2, 12)}`;
  }

  verifySignature(): boolean {
    // Implement Ed25519 signature verification logic
    return true; // Placeholder, will implement actual verification
  }
}