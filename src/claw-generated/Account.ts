import { Transaction } from './Transaction';

export class Account {
  address: string;
  balance: number = 0;
  transactions: Transaction[] = [];

  constructor(address: string) {
    this.address = address;
  }

  addTransaction(tx: Transaction): void {
    this.transactions.push(tx);
    if (tx.from === this.address) {
      this.balance -= tx.amount;
    } else if (tx.to === this.address) {
      this.balance += tx.amount;
    }
  }
}