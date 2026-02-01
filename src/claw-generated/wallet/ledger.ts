// src/claw-generated/wallet/ledger.ts

import { HardwareWalletTransport, WalletAccount } from './hardware';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { LedgerApp } from '@ledgerhq/live-common/lib/apps/ledger';

export class LedgerTransport implements HardwareWalletTransport {
  private app: LedgerApp;

  async connect(): Promise<void> {
    const transport = await TransportWebUSB.create();
    this.app = new LedgerApp(transport);
  }

  async disconnect(): Promise<void> {
    await this.app.transport.close();
  }

  async getAccounts(): Promise<WalletAccount[]> {
    const accounts = await this.app.getAccounts(0, 5); // Get first 5 accounts
    return accounts.map((account) => ({
      address: account.address,
      publicKey: account.publicKey,
    }));
  }

  async signTransaction(account: WalletAccount, transaction: any): Promise<any> {
    const signature = await this.app.signTransaction(
      account.address,
      transaction
    );
    return signature;
  }
}