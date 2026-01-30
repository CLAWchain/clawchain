import { RWLock } from 'async-rwlock';

class StateManager {
  private state: Map<string, any> = new Map();
  private lock: RWLock = new RWLock();

  async get(key: string): Promise<any> {
    await this.lock.readLock();
    try {
      return this.state.get(key);
    } finally {
      this.lock.readUnlock();
    }
  }

  async set(key: string, value: any): Promise<void> {
    await this.lock.writeLock();
    try {
      this.state.set(key, value);
    } finally {
      this.lock.writeUnlock();
    }
  }

  async delete(key: string): Promise<void> {
    await this.lock.writeLock();
    try {
      this.state.delete(key);
    } finally {
      this.lock.writeUnlock();
    }
  }
}

export default StateManager;