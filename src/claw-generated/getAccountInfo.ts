import { Account } from '../state/account';

export async function getAccountInfo(pubkey: string): Promise<{
  lamports: number;
  owner: string;
  executable: boolean;
}> {
  const account = await Account.getByPublicKey(pubkey);
  if (!account) {
    throw new Error(`Account not found for pubkey: ${pubkey}`);
  }

  return {
    lamports: account.lamports,
    owner: account.owner.toBase58(),
    executable: account.executable
  };
}