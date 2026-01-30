import { AccountsDb } from "../state/accounts_db";
import { Account } from "../state/account";

const accountsDb = new AccountsDb();

export async function getAccountInfo(pubkey: Uint8Array): Promise&lt;{
  lamports: number;
  owner: Uint8Array;
  executable: boolean;
}> {
  const account = accountsDb.getAccount(pubkey);
  if (!account) {
    throw new Error("Account not found");
  }
  return {
    lamports: account.lamports,
    owner: account.owner,
    executable: account.executable
  };
}

export const rpcHandlers = {
  getAccountInfo
};