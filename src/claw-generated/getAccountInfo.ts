import { PublicKey } from '@solana/web3.js';
import { getAccount, getAccountOwner, getAccountExecutable, getAccountLamports } from '../db/accounts';

interface GetAccountInfoResponse {
  account: any;
  lamports: number;
  owner: PublicKey;
  executable: boolean;
}

export async function getAccountInfo(pubkey: PublicKey): Promise<GetAccountInfoResponse> {
  const account = await getAccount(pubkey);
  const owner = await getAccountOwner(pubkey);
  const executable = await getAccountExecutable(pubkey);
  const lamports = await getAccountLamports(pubkey);

  return {
    account,
    lamports,
    owner,
    executable
  };
}