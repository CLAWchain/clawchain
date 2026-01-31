import { Transaction } from './transaction';

export interface Account {
  address: string;
  balance: number;
  nonce: number;
  validateTransaction(tx: Transaction): boolean;
}

export class EOAAccount implements Account {
  address: string;
  balance: number;
  nonce: number;

  constructor(address: string, balance: number, nonce: number) {
    this.address = address;
    this.balance = balance;
    this.nonce = nonce;
  }

  validateTransaction(tx: Transaction): boolean {
    return tx.from === this.address && tx.nonce === this.nonce;
  }
}