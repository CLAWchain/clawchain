import { Account } from '../types';

export async function getBalance(pubkey: string): Promise<number> {
  const account = await Account.get(pubkey);
  return account.balance;
}