import { Account } from './account';
import { PublicKey } from '@solana/web3.js';

export class AccountManager {
  private accounts: Map<string, Account> = new Map();

  getAccount(pubkey: PublicKey): Account {
    const pubkeyStr = pubkey.toString();
    if (this.accounts.has(pubkeyStr)) {
      return this.accounts.get(pubkeyStr)!;
    } else {
      const newAccount = new Account(pubkey, 0);
      this.accounts.set(pubkeyStr, newAccount);
      return newAccount;
    }
  }

  updateBalance(pubkey: PublicKey, newBalance: number): void {
    const account = this.getAccount(pubkey);
    account.balance = newBalance;
  }
}