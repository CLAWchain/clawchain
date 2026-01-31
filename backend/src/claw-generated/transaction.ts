export class Transaction {
  from: string;
  to: string;
  amount: number;
  nonce: number;

  constructor(from: string, to: string, amount: number, nonce: number) {
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.nonce = nonce;
  }

  // Add methods for signing, verifying, etc.
}