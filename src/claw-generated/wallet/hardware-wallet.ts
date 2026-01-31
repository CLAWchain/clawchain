import { Transaction } from '../transaction/transaction';
import { Wallet } from './wallet';
import Transport from '@ledgerhq/hw-transport-node-hid';
import Eth from '@ledgerhq/hw-app-eth';

/**
 * HardwareWallet class for interfacing with Ledger and Trezor devices.
 */
export class HardwareWallet extends Wallet {
  private transport: Transport;
  private ethApp: Eth;

  /**
   * Connect to the hardware wallet device.
   */
  async connect(): Promise<void> {
    this.transport = await Transport.create();
    this.ethApp = new Eth(this.transport);
  }

  /**
   * Sign a transaction using the hardware wallet.
   * @param transaction The transaction to sign.
   * @returns The signed transaction.
   */
  async signTransaction(transaction: Transaction): Promise<Transaction> {
    const { r, s, v } = await this.ethApp.signTransaction(
      "44'/60'/0'/0/0",
      transaction.serialize()
    );

    transaction.r = r;
    transaction.s = s;
    transaction.v = v;

    return transaction;
  }

  /**
   * Disconnect from the hardware wallet device.
   */
  async disconnect(): Promise<void> {
    await this.transport.close();
  }
}