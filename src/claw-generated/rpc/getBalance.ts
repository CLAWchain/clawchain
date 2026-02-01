import { getAccountInfo } from '../utils/network';

export async function getBalance(pubkey: string): Promise&lt;number&gt; {
  const accountInfo = await getAccountInfo(pubkey);
  return accountInfo.lamports;
}