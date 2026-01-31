import { Account } from '../account';

export interface GetAccountInfoParams {
  pubkey: string;
}

export interface GetAccountInfoResult {
  lamports: number;
  owner: string;
  executable: boolean;
}

export async function getAccountInfo(params: GetAccountInfoParams): Promise<GetAccountInfoResult> {
  const account = await Account.getAccount(params.pubkey);
  if (!account) {
    throw new Error(`Account not found for pubkey: ${params.pubkey}`);
  }

  return {
    lamports: account.lamports,
    owner: account.owner.toBase58(),
    executable: account.executable
  };
}