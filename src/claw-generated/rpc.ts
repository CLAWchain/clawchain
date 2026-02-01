import { getBalance as getBalanceImpl } from './rpc';

export async function getBalance(pubkey: string): Promise<number> {
  return await getBalanceImpl(pubkey);
}