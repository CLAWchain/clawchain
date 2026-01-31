import { Account } from './account';
import { StateManager } from './state/manager';
import { Transaction } from './transaction';

export class RPCServer {
  private stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  async getBalance(pubkey: string): Promise<number> {
    const account = await this.stateManager.getAccount(pubkey);
    return account ? account.balance : 0;
  }

  async getTransaction(signature: string): Promise<Transaction | null> {
    const transaction = await this.stateManager.getTransaction(signature);
    return transaction || null;
  }

  async getAccountInfo(pubkey: string): Promise<{
    lamports: number;
    owner: string;
    executable: boolean;
  }> {
    const account = await this.stateManager.getAccount(pubkey);
    if (!account) {
      return {
        lamports: 0,
        owner: '',
        executable: false
      };
    }

    return {
      lamports: account.balance,
      owner: account.owner.toString(),
      executable: account.executable
    };
  }
}