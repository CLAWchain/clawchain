import { Transaction } from './transaction';
import { calculateFee } from './transaction_fees';

export class Block {
  transactions: Transaction[] = [];
  totalFees: number = 0;

  addTransaction(tx: Transaction) {
    this.transactions.push(tx);
    this.totalFees += calculateFee(tx);
  }

  getBlockReward(): number {
    // Calculate block reward based on total fees collected
    return 10 + this.totalFees;
  }
}