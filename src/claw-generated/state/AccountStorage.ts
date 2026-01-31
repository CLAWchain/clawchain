import { StateManager } from './StateManager';

class AccountStorage {
  private readonly stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  async getAccountState(address: string): Promise<Account | null> {
    try {
      return await this.stateManager.getState(`account:${address}`);
    } catch (err) {
      console.error(`Error fetching account state for ${address}:`, err);
      return null;
    }
  }

  async setAccountState(address: string, account: Account, blockNumber: number): Promise<void> {
    try {
      await this.stateManager.setState(`account:${address}`, account, blockNumber);
    } catch (err) {
      console.error(`Error setting account state for ${address}:`, err);
    }
  }
}

export { AccountStorage, Account, AccountInfo };