import { Transaction } from '../transaction/transaction';

export class TransactionFeeCalculator {
  static calculateFee(transaction: Transaction): number {
    // Calculate fee based on transaction size and complexity
    let fee = 0;

    // Base fee
    fee += 0.001;

    // Size-based fee
    fee += transaction.size * 0.00001;

    // Complexity-based fee
    if (transaction.hasContract) {
      fee += 0.01;
    }

    return fee;
  }
}