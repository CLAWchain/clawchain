import { Ed25519Signature, Ed25519PublicKey, verifyEd25519Signature } from 'crypto';

export class Transaction {
  sender: Ed25519PublicKey;
  recipient: Ed25519PublicKey;
  amount: number;
  signature: Ed25519Signature;

  constructor(sender: Ed25519PublicKey, recipient: Ed25519PublicKey, amount: number, signature: Ed25519Signature) {
    this.sender = sender;
    this.recipient = recipient;
    this.amount = amount;
    this.signature = signature;
  }

  verifySignature(): boolean {
    return verifyEd25519Signature(this.sender, this.signature, this.toSignatureData());
  }

  toSignatureData(): Uint8Array {
    return new TextEncoder().encode(`${this.sender}:${this.recipient}:${this.amount}`);
  }
}