// src/claw-generated/wallet/hardware.ts

import { WalletAccount } from './index';
import { LedgerTransport } from './ledger';
import { TrezorTransport } from './trezor';

export interface HardwareWalletTransport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getAccounts(): Promise<WalletAccount[]>;
  signTransaction(account: WalletAccount, transaction: any): Promise<any>;
}

export class HardwareWalletManager {
  private transports: HardwareWalletTransport[] = [];

  constructor() {
    this.transports.push(new LedgerTransport());
    this.transports.push(new TrezorTransport());
  }

  async getAccounts(): Promise<WalletAccount[]> {
    const accounts = await Promise.all(
      this.transports.map(async (transport) => {
        return await transport.getAccounts();
      })
    );
    return accounts.flat();
  }

  async signTransaction(account: WalletAccount, transaction: any): Promise<any> {
    for (const transport of this.transports) {
      try {
        return await transport.signTransaction(account, transaction);
      } catch (e) {
        // Try next transport if one fails
      }
    }
    throw new Error('Failed to sign transaction');
  }
}