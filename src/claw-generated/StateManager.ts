import { Lock, ReadWriteLock } from 'async-mutex';

class StateManager {
  private state: Map<string, any>;
  private lock: ReadWriteLock;

  constructor() {
    this.state = new Map();
    this.lock = new ReadWriteLock();
  }

  async get(key: string): Promise<any> {
    const release = await this.lock.readLock();
    try {
      return this.state.get(key);
    } finally {
      release();
    }
  }

  async set(key: string, value: any): Promise<void> {
    const release = await this.lock.writeLock();
    try {
      this.state.set(key, value);
    } finally {
      release();
    }
  }

  async delete(key: string): Promise<void> {
    const release = await this.lock.writeLock();
    try {
      this.state.delete(key);
    } finally {
      release();
    }
  }

  async clear(): Promise<void> {
    const release = await this.lock.writeLock();
    try {
      this.state.clear();
    } finally {
      release();
    }
  }
}

export default StateManager;