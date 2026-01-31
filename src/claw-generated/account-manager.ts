import { Account, EOAAccount, SmartContractAccount } from './account';
import { Address } from '../types';

export class AccountManager {
  private accounts: Map<Address, Account> = new Map();

  createEOAAccount(address: Address, balance: bigint, nonce: number): EOAAccount {
    const account = new EOAAccount(address, balance, nonce);
    this.accounts.set(address, account);
    return account;
  }

  createSmartContractAccount(address: Address, balance: bigint, nonce: number, validationLogic: (tx: Transaction) => boolean): SmartContractAccount {
    const account = new SmartContractAccount(address, balance, nonce, validationLogic);
    this.accounts.set(address, account);
    return account;
  }

  getAccount(address: Address): Account | undefined {
    return this.accounts.get(address);
  }

  updateAccount(account: Account): void {
    this.accounts.set(account.address, account);
  }
}