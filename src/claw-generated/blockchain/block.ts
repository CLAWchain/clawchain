import { Transaction } from '../transactions';

export class Block {
  transactions: Transaction[];

  constructor(transactions: Transaction[]) {
    this.transactions = transactions;
  }

  validateTransactions(): boolean {
    for (const tx of this.transactions) {
      if (!tx.verifySignature()) {
        return false;
      }
    }
    return true;
  }
}