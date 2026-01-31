import { PublicKey } from '@solana/web3.js';

export class Account {
  pubkey: PublicKey;
  lamports: number;

  constructor(pubkey: PublicKey, lamports: number) {
    this.pubkey = pubkey;
    this.lamports = lamports;
  }

  getBalance(): number {
    return this.lamports;
  }
}

export class AccountState {
  private accounts: Map<string, Account> = new Map();

  getAccount(pubkey: PublicKey): Account | undefined {
    return this.accounts.get(pubkey.toBase58());
  }

  addAccount(account: Account): void {
    this.accounts.set(account.pubkey.toBase58(), account);
  }

  updateBalance(pubkey: PublicKey, lamports: number): void {
    const account = this.getAccount(pubkey);
    if (account) {
      account.lamports = lamports;
    } else {
      this.addAccount(new Account(pubkey, lamports));
    }
  }
}

export const accountState = new AccountState();