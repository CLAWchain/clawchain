import { Account, AccountInfo } from '../state/account';

export async function getAccountInfo(pubkey: string): Promise<AccountInfo> {
  const account = await Account.get(pubkey);
  if (!account) {
    throw new Error(`Account not found: ${pubkey}`);
  }

  return {
    lamports: account.lamports,
    owner: account.owner,
    executable: account.executable
  };
}