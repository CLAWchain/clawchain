// src/claw-generated/block/index.ts

import { Transaction } from '../transaction';
import { Account } from '../account';

export class Block {
  transactions: Transaction[];
  accounts: Account[];

  constructor(transactions: Transaction[], accounts: Account[]) {
    this.transactions = transactions;
    this.accounts = accounts;
  }

  validate(): boolean {
    for (const tx of this.transactions) {
      const account = this.accounts.find(a => a.address === tx.from);
      if (!account || !account.validate(tx)) {
        return false;
      }
    }
    return true;
  }
}