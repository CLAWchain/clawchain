import { ReadWriteLock } from '../utils/ReadWriteLock';

/**
 * StateManager is responsible for managing the global state of the ClawChain network.
 * It provides thread-safe read and write operations to ensure consistency and prevent race conditions.
 */
export class StateManager {
  private readonly lock: ReadWriteLock;
  private state: Map<string, any>;

  constructor() {
    this.lock = new ReadWriteLock();
    this.state = new Map();
  }

  /**
   * Get the value of a state variable.
   * @param key The key of the state variable to retrieve.
   * @returns The value of the state variable.
   */
  public async get(key: string): Promise<any> {
    return this.lock.readLock(async () => {
      return this.state.get(key);
    });
  }

  /**
   * Set the value of a state variable.
   * @param key The key of the state variable to set.
   * @param value The new value for the state variable.
   */
  public async set(key: string, value: any): Promise<void> {
    await this.lock.writeLock(async () => {
      this.state.set(key, value);
    });
  }

  /**
   * Delete a state variable.
   * @param key The key of the state variable to delete.
   */
  public async delete(key: string): Promise<void> {
    await this.lock.writeLock(async () => {
      this.state.delete(key);
    });
  }
}