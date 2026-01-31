import { PublicKey } from '@solana/web3.js';
import { Account } from '../state/account';

export interface GetAccountInfoResponse {
  pubkey: string;
  lamports: number;
  owner: string;
  executable: boolean;
}

export async function getAccountInfo(pubkey: PublicKey): Promise<GetAccountInfoResponse> {
  const account = await Account.get(pubkey);
  return {
    pubkey: pubkey.toBase58(),
    lamports: account.lamports,
    owner: account.owner.toBase58(),
    executable: account.executable
  };
}