import { BigNumber } from 'ethers';

export class Account {
  public address: string;
  public balance: BigNumber;
  public nonce: number;
  public storageSlots: Map<string, any>;

  constructor(address: string) {
    this.address = address;
    this.balance = BigNumber.from(0);
    this.nonce = 0;
    this.storageSlots = new Map();
  }

  public setBalance(balance: BigNumber): void {
    this.balance = balance;
  }

  public incrementNonce(): void {
    this.nonce++;
  }

  public getStorageSlot(key: string): any {
    return this.storageSlots.get(key);
  }

  public setStorageSlot(key: string, value: any): void {
    this.storageSlots.set(key, value);
  }
}