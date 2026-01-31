import { createVerify } from 'crypto';

export class Transaction {
  private sender: string;
  private recipient: string;
  private amount: number;
  private signature: Buffer;

  constructor(sender: string, recipient: string, amount: number, signature: Buffer) {
    this.sender = sender;
    this.recipient = recipient;
    this.amount = amount;
    this.signature = signature;
  }

  verifySignature(senderPublicKey: string): boolean {
    const verify = createVerify('SHA256');
    verify.update(this.getSignatureData());
    return verify.verify(senderPublicKey, this.signature);
  }

  getSignatureData(): string {
    return `${this.sender}:${this.recipient}:${this.amount}`;
  }
}