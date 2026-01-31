import { PublicKey } from '@solana/web3.js';
import { BigNumber } from 'ethers';

export class Account {
  pubkey: PublicKey;
  lamports: number;
  stakedBalance: BigNumber;
  lastClaimTime: number;

  constructor(pubkey: PublicKey, lamports: number, stakedBalance: BigNumber, lastClaimTime: number) {
    this.pubkey = pubkey;
    this.lamports = lamports;
    this.stakedBalance = stakedBalance;
    this.lastClaimTime = lastClaimTime;
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

  updateBalance(pubkey: PublicKey, lamports: number, stakedBalance: BigNumber, lastClaimTime: number): void {
    const account = this.getAccount(pubkey);
    if (account) {
      account.lamports = lamports;
      account.stakedBalance = stakedBalance;
      account.lastClaimTime = lastClaimTime;
    } else {
      this.addAccount(new Account(pubkey, lamports, stakedBalance, lastClaimTime));
    }
  }
}

export const accountState = new AccountState();