import { ReadWriteLock } from './ReadWriteLock';

class StateManager {
  private readonly locks: Map<string, ReadWriteLock>;

  constructor() {
    this.locks = new Map();
  }

  async getState(key: string): Promise<any> {
    const lock = this.getLock(key);
    await lock.readLock();
    try {
      // Fetch state from storage and return
      return await this.fetchState(key);
    } finally {
      lock.readUnlock();
    }
  }

  async setState(key: string, value: any): Promise<void> {
    const lock = this.getLock(key);
    await lock.writeLock();
    try {
      // Update state in storage
      await this.updateState(key, value);
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