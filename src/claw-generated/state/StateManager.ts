import { ReadWriteLock } from './ReadWriteLock';
import { StateDiffManager } from './StateDiffManager';

class StateManager {
  private readonly locks: Map<string, ReadWriteLock>;
  private readonly stateDiffManager: StateDiffManager;

  constructor(stateDiffManager: StateDiffManager) {
    this.locks = new Map();
    this.stateDiffManager = stateDiffManager;
  }

  async getState(key: string): Promise<any> {
    const lock = this.getLock(key);
    await lock.readLock();
    try {
      return await this.fetchState(key);
    } finally {
      lock.readUnlock();
    }
  }

  async setState(key: string, value: any, blockNumber: number): Promise<void> {
    const lock = this.getLock(key);
    await lock.writeLock();
    try {
      const oldValue = await this.fetchState(key);
      await this.updateState(key, value);
      await this.stateDiffManager.trackDiff(blockNumber, [key]);
    } finally {
      lock.writeUnlock();
    }
  }

  private getLock(key: string): ReadWriteLock {
    let lock = this.locks.get(key);
    if (!lock) {
      lock = new ReadWriteLock();
      this.locks.set(key, lock);
    }
    return lock;
  }

  private async fetchState(key: string): Promise<any> {
    // Fetch state from storage
    return await this.storageProvider.get(key);
  }

  private async updateState(key: string, value: any): Promise<void> {
    // Update state in storage
    await this.storageProvider.set(key, value);
  }
}

export { StateManager };