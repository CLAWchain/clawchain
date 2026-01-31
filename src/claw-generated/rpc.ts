import { Account } from '../state/account';
import { StateManager } from '../state/manager';

export class RPCServer {
  private stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  async getBalance(pubkey: string): Promise<number> {
    const account = await this.stateManager.getAccount(pubkey);
    return account ? account.balance : 0;
  }
}