import { Account } from "./account";

export class AccountsDb {
  private accounts: Map<string, Account>;

  constructor() {
    this.accounts = new Map();
  }

  createAccount(pubkey: Uint8Array, lamports: number, owner: Uint8Array, executable: boolean): Account {
    const account = new Account(pubkey, lamports, owner, executable);
    this.accounts.set(this.getAccountKey(pubkey), account);
    return account;
  }

  getAccount(pubkey: Uint8Array): Account | undefined {
    return this.accounts.get(this.getAccountKey(pubkey));
  }

  updateAccount(pubkey: Uint8Array, lamports: number, owner: Uint8Array, executable: boolean): Account {
    const account = this.getAccount(pubkey);
    if (account) {
      account.lamports = lamports;
      account.owner = owner;
      account.executable = executable;
    }
    return account;
  }

  private getAccountKey(pubkey: Uint8Array): string {
    return Buffer.from(pubkey).toString("hex");
  }
}