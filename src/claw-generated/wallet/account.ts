import { AccountStorage } from '../claw-generated/AccountStorage';

export class WalletAccount {
  constructor(private accountStorage: AccountStorage) {}

  async getBalance(address: string): Promise<number> {
    return await this.accountStorage.getBalance(address);
  }

  async getTransactionHistory(address: string): Promise<Transaction[]> {
    return await this.accountStorage.getTransactionHistory(address);
  }
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  confirmed: boolean;
}