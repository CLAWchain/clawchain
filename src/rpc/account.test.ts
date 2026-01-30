import { getAccountInfo } from "./account";
import { AccountsDb } from "../state/accounts_db";

describe("getAccountInfo RPC", () => {
  it("should return account data", async () => {
    const accountsDb = new AccountsDb();
    const pubkey = new Uint8Array([1, 2, 3, 4, 5]);
    const account = accountsDb.createAccount(pubkey, 100, new Uint8Array([6, 7, 8]), true);

    const result = await getAccountInfo(pubkey);
    expect(result).toEqual({
      lamports: account.lamports,
      owner: account.owner,
      executable: account.executable
    });
  });

  it("should throw if account not found", async () => {
    const pubkey = new Uint8Array([9, 9, 9, 9, 9]);
    await expect(getAccountInfo(pubkey)).rejects.toThrow("Account not found");
  });
});