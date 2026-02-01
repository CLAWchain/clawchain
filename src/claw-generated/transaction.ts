import { Account } from '../account/account';

export class Transaction {
  readonly from: Account;
  readonly to: Account;
  readonly amount: number;
  readonly nonce: number;
  readonly signature: string;

  constructor(from: Account, to: Account, amount: number, nonce: number, signature: string) {
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.nonce = nonce;
    this.signature = signature;
  }

  validate(): boolean {
    // Verify the signature
    if (!this.from.verifySignature(this.signature)) {
      return false;
    }

    // Validate the nonce
    if (this.nonce !== this.from.nonce) {
      return false;
    }

    // Validate the sender's balance
    if (this.from.balance < this.amount) {
      return false;
    }

    return true;
  }
}