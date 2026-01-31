import { AccountStorageManager, AccountStateNode } from './AccountStorage';
import { StateManager } from './StateManager';

class ContractStorageManager {
  private accountStorage: AccountStorageManager;

  constructor(stateManager: StateManager) {
    this.accountStorage = new AccountStorageManager(stateManager);
  }

  async getContractState(address: string): Promise<AccountStateNode> {
    return this.accountStorage.getAccountState(address);
  }

  async setContractState(address: string, state: AccountStateNode): Promise<void> {
    await this.accountStorage.setAccountState(address, state);
  }

  async commitContractChanges(): Promise<void> {
    await this.accountStorage.commitAccountChanges();
  }
}

export { ContractStorageManager };