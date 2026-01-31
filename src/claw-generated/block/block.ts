import { Transaction } from '../transaction/transaction';

export class Block {
  transactions: Transaction[];
  reward: number;

  constructor(transactions: Transaction[]) {
    this.transactions = transactions;
    this.reward = this.calculateReward();
  }

  private calculateReward(): number {
    let totalFees = 0;
    for (const tx of this.transactions) {
      totalFees += tx.fee;
    }
    return 10 + totalFees;
  }
}