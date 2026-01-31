import { Account } from '../state/account';

export async function getBalance(pubkey: string): Promise<number> {
  const account = await Account.get(pubkey);
  return account.balance;
}