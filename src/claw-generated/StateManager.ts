import { Account } from './account';

export class StateManager {
  private accounts: Map<string, Account> = new Map();

  async getBalance(address: string): Promise<bigint> {
    const account = await this.getAccount(address);
    return account.balance;
  }

  async getNonce(address: string): Promise<number> {
    const account = await this.getAccount(address);
    return account.nonce;
  }

  async incrementNonce(address: string): Promise<void> {
    const account = await this.getAccount(address);
    account.nonce++;
    this.accounts.set(address, account);
    // Persist account state
  }

  private async getAccount(address: string): Promise<Account> {
    if (this.accounts.has(address)) {
      return this.accounts.get(address)!;
    }

    // Load account from storage
    const account: Account = {
      address,
      balance: 0n,
      nonce: 0
    };
    this.accounts.set(address, account);
    return account;
  }
}