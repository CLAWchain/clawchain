import { StateManager } from './StateManager';

class StateDiffManager {
  private readonly stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  async trackDiff(blockNumber: number, changedKeys: string[]) {
    for (const key of changedKeys) {
      const oldValue = await this.stateManager.getState(key);
      const newValue = await this.stateManager.getState(`${key}:${blockNumber}`);
      await this.storeDiff(blockNumber, key, oldValue, newValue);
    }
  }

  private async storeDiff(blockNumber: number, key: string, oldValue: any, newValue: any) {
    // Store the state diff in a dedicated storage or database
    await this.diffStorage.set(`${blockNumber}:${key}`, { oldValue, newValue });
  }

  async applyDiff(blockNumber: number, changedKeys: string[]) {
    for (const key of changedKeys) {
      const { oldValue, newValue } = await this.diffStorage.get(`${blockNumber}:${key}`);
      await this.stateManager.setState(key, newValue);
    }
  }
}

export { StateDiffManager };