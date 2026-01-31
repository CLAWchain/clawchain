import { ContractStorageManager } from '../state/ContractStorage';
import { StateManager } from '../state/StateManager';
import { AccountStateNode } from '../state/AccountStorage';

class ContractExecutor {
  private contractStorage: ContractStorageManager;

  constructor(stateManager: StateManager) {
    this.contractStorage = new ContractStorageManager(stateManager);
  }

  async executeContract(address: string, input: Uint8Array): Promise<Uint8Array> {
    const contractState = await this.contractStorage.getContractState(address);
    // Execute contract logic using the retrieved contract state
    // ...
    await this.contractStorage.setContractState(address, contractState);
    await this.contractStorage.commitContractChanges();
    return new Uint8Array(); // Return the contract's output
  }
}

export { ContractExecutor };