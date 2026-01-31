import { Account } from "./account";

export class Transaction {
  from: Account;
  to: Account;
  amount: number;
  nonce: number;

  constructor(from: Account, to: Account, amount: number, nonce: number) {
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.nonce = nonce;
  }

  validate(): boolean {
    // Check that the nonce is greater than the current nonce for the from account
    if (this.nonce <= this.from.nonce) {
      return false;
    }

    // Update the from account's nonce
    this.from.nonce = this.nonce;

    return true;
  }
}