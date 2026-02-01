// src/claw-generated/wallet/index.ts

import { HardwareWalletManager } from './hardware';

export interface WalletAccount {
  address: string;
  publicKey: string;
}

export class WalletManager {
  private hardwareWalletManager: HardwareWalletManager;

  constructor() {
    this.hardwareWalletManager = new HardwareWalletManager();
  }

  async getAccounts(): Promise<WalletAccount[]> {
    const accounts = await this.hardwareWalletManager.getAccounts();
    return accounts;
  }

  async signTransaction(account: WalletAccount, transaction: any): Promise<any> {
    return await this.hardwareWalletManager.signTransaction(account, transaction);
  }
}