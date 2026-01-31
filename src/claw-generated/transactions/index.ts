import { Ed25519Signature } from './signature';

export class Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  signature: Ed25519Signature;

  constructor(from: string, to: string, amount: number, signature: Ed25519Signature) {
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.signature = signature;
    this.id = this.generateId();
  }

  generateId(): string {
    // Implement transaction ID generation logic
    return `tx_${Date.now()}`;
  }

  verifySignature(): boolean {
    // Verify the transaction signature using the Ed25519Signature class
    const message = this.getMessageToSign();
    return this.signature.verify(message);
  }

  private getMessageToSign(): Uint8Array {
    // Implement logic to generate the message to be signed
    return new Uint8Array([]);
  }
}