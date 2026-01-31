import { Transaction } from './transaction';

export class Block {
  private transactions: Transaction[];
  private blockReward: number;

  constructor(transactions: Transaction[]) {
    this.transactions = transactions;
    this.blockReward = this.calculateBlockReward();
  }

  private calculateBlockReward(): number {
    let totalFees = 0;
    for (const tx of this.transactions) {
      totalFees += tx.calculateFee();
    }
    return 10 + totalFees; // Base reward + total transaction fees
  }
}