import { Ed25519Keypair } from '../crypto/ed25519';

export class Transaction {
  readonly type: string;
  readonly from: string;
  readonly to: string;
  readonly amount: number;
  readonly timestamp: number;
  readonly signature?: string;

  constructor(type: string, from: string, to: string, amount: number) {
    this.type = type;
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.timestamp = Date.now();
  }

  serialize(): string {
    return JSON.stringify({
      type: this.type,
      from: this.from,
      to: this.to,
      amount: this.amount,
      timestamp: this.timestamp
    });
  }

  sign(keypair: Ed25519Keypair): void {
    const signature = keypair.sign(this.serialize());
    this.signature = signature;
  }
}