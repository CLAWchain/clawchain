import { Transaction } from '../types';
import { HardwareWallet } from './hardware-wallet';

export interface Wallet {
  getPublicKey(): Promise<string>;
  signTransaction(tx: Transaction): Promise<string>;
}

export class LocalWallet implements Wallet {
  private hardwareWallet: HardwareWallet;

  async connect(): Promise<void> {
    this.hardwareWallet = new HardwareWallet();
    await this.hardwareWallet.connect();
  }

  async getPublicKey(): Promise<string> {
    return this.hardwareWallet.getPublicKey();
  }

  async signTransaction(tx: Transaction): Promise<string> {
    return this.hardwareWallet.signTransaction(tx);
  }
}