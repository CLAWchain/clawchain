import { Account, Transaction, TransactionStatus } from '../types';

export class Wallet {
  private _balance: number;
  private _transactions: Transaction[];

  constructor(private _address: string) {
    this._balance = 0;
    this._transactions = [];
  }

  get address(): string {
    return this._address;
  }

  get balance(): number {
    return this._balance;
  }

  get transactions(): Transaction[] {
    return this._transactions;
  }

  async fetchBalance(): Promise<number> {
    // TODO: Implement fetching balance from chain state
    return this._balance;
  }

  async fetchTransactions(): Promise<Transaction[]> {
    // TODO: Implement fetching transactions from chain state
    return this._transactions;
  }

  async getTransactionHistory(status: TransactionStatus = TransactionStatus.Confirmed): Promise<Transaction[]> {
    const transactions = await this.fetchTransactions();
    return transactions.filter(tx => tx.status === status);
  }
}

export interface Account {
  address: string;
  balance: number;
}

export enum TransactionStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Failed = 'failed'
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  status: TransactionStatus;
}