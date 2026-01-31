import { Transaction } from '../transaction/transaction';
import { Account } from '../account/account';

export class Block {
  transactions: Transaction[];
  reward: number;
  minerAddress: string;

  constructor(transactions: Transaction[], minerAddress: string) {
    this.transactions = transactions;
    this.minerAddress = minerAddress;
    this.reward = 0;
  }

  processTransactions(): void {
    for (const tx of this.transactions) {
      tx.apply(this);
    }
  }

  getMinerReward(): number {
    return this.reward;
  }
}