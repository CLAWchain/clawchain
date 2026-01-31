import { ReadWriteLock } from '../utils/ReadWriteLock';

/**
 * AccountStateManager is responsible for managing the state of individual accounts on the ClawChain network.
 * It provides thread-safe read and write operations to ensure consistency and prevent race conditions.
 */
export class AccountStateManager {
  private readonly lock: ReadWriteLock;
  private accountState: Map<string, Map<string, any>>;

  constructor() {
    this.lock = new ReadWriteLock();
    this.accountState = new Map();
  }

  /**
   * Get the value of a state variable for a specific account.
   * @param accountAddress The address of the account.
   * @param key The key of the state variable to retrieve.
   * @returns The value of the state variable.
   */
  public async get(accountAddress: string, key: string): Promise<any> {
    return this.lock.readLock(async () => {
      const accountMap = this.accountState.get(accountAddress);
      return accountMap?.get(key);
    });
  }

  /**
   * Set the value of a state variable for a specific account.
   * @param accountAddress The address of the account.
   * @param key The key of the state variable to set.
   * @param value The new value for the state variable.
   */
  public async set(accountAddress: string, key: string, value: any): Promise<void> {
    await this.lock.writeLock(async () => {
      let accountMap = this.accountState.get(accountAddress);
      if (!accountMap) {
        accountMap = new Map();
        this.accountState.set(accountAddress, accountMap);
      }
      accountMap.set(key, value);
    });
  }

  /**
   * Delete a state variable for a specific account.
   * @param accountAddress The address of the account.
   * @param key The key of the state variable to delete.
   */
  public async delete(accountAddress: string, key: string): Promise<void> {
    await this.lock.writeLock(async () => {
      const accountMap = this.accountState.get(accountAddress);
      if (accountMap) {
        accountMap.delete(key);
      }
    });
  }
}