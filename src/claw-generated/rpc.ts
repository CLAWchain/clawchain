import { Account } from '../account/account';

export class RPCServer {
  async getAccountInfo(pubkey: string): Promise<Account | null> {
    // Look up account data by pubkey
    const account = await Account.getByPubkey(pubkey);
    if (!account) {
      return null;
    }

    // Return account data, lamports, owner, and executable flag
    return {
      pubkey: account.pubkey,
      lamports: account.lamports,
      owner: account.owner,
      executable: account.executable
    };
  }
}