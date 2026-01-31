import { calculateFee } from './transaction_fees';

export class Transaction {
  // Transaction fields go here

  execute(senderBalance: number): number {
    const fee = calculateFee(this);
    const newBalance = senderBalance - this.amount - fee;
    return newBalance;
  }
}