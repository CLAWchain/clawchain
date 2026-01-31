import { Account, AccountInfo } from '../state/account';
import { TxnProcessor } from '../tx/processor';

export class RPCServer {
  private accounts: Account[];
  private txnProcessor: TxnProcessor;

  constructor(accounts: Account[], txnProcessor: TxnProcessor) {
    this.accounts = accounts;
    this.txnProcessor = txnProcessor;
  }

  async getAccountInfo(pubkey: string): Promise<AccountInfo> {
    const account = this.accounts.find(a => a.publicKey === pubkey);
    if (!account) {
      throw new Error(`Account not found: ${pubkey}`);
    }

    return {
      lamports: account.lamports,
      owner: account.owner.toString(),
      executable: account.executable
    };
  }

  async processTransaction(tx: any): Promise<void> {
    this.txnProcessor.processTransaction(tx);
  }
}