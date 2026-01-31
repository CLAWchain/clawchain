import { Account } from './account';

export class Transaction {
  public from: Account;
  public to: Account;
  public amount: number;
  public nonce: number;
  public signature: string;

  constructor(from: Account, to: Account, amount: number, nonce: number, signature: string) {
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.nonce = nonce;
    this.signature = signature;
  }
}