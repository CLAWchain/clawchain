import { Account } from '../types';

const accounts: Record<string, Account> = {};

export const getAccountBalance = async (pubkey: string): Promise<number> => {
  if (accounts[pubkey]) {
    return accounts[pubkey].balance;
  }
  return 0;
};

export const updateAccountBalance = (pubkey: string, balance: number) => {
  if (!accounts[pubkey]) {
    accounts[pubkey] = { pubkey, balance };
  } else {
    accounts[pubkey].balance = balance;
  }
};