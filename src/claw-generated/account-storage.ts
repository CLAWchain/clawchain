import { BigNumber } from 'ethers';

export class AccountStorage {
  private storage: Map<string, Map<string, BigNumber>> = new Map();

  get(address: string, key: string): BigNumber {
    const accountStorage = this.storage.get(address);
    if (accountStorage) {
      return accountStorage.get(key) || BigNumber.from(0);
    }
    return BigNumber.from(0);
  }

  set(address: string, key: string, value: BigNumber): void {
    let accountStorage = this.storage.get(address);
    if (!accountStorage) {
      accountStorage = new Map();
      this.storage.set(address, accountStorage);
    }
    accountStorage.set(key, value);
  }

  /**
   * Retrieves the entire storage for a given account address.
   * @param address The Ethereum address to retrieve the storage for.
   * @returns A Map containing the key-value pairs for the given address.
   */
  getAccountStorage(address: string): Map<string, BigNumber> {
    return this.storage.get(address) || new Map();
  }

  /**
   * Clears the storage for a given account address.
   * @param address The Ethereum address to clear the storage for.
   */
  clearAccountStorage(address: string): void {
    this.storage.delete(address);
  }
}