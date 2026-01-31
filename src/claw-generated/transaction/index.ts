// src/claw-generated/transaction/index.ts

import { Account } from '../account';

export class Transaction {
  from: string;
  to: string;
  value: number;
  nonce: number;

  constructor(from: string, to: string, value: number, nonce: number) {
    this.from = from;
    this.to = to;
    this.value = value;
    this.nonce = nonce;
  }

  validate(account: Account): boolean {
    return account.validate(this);
  }
}