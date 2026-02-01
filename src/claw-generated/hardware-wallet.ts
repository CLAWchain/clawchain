import { Wallet } from './wallet';
import { Transaction } from '../types';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import Ledger from '@ledgerhq/hw-app-eth';

export class HardwareWallet implements Wallet {
  private transport: TransportWebUSB;
  private ledger: Ledger;

  async connect(): Promise<void> {
    this.transport = await TransportWebUSB.create();
    this.ledger = new Ledger(this.transport);
  }

  async getPublicKey(): Promise<string> {
    const { publicKey } = await this.ledger.getAddress("44'/60'/0'/0/0");
    return publicKey;
  }

  async signTransaction(tx: Transaction): Promise<string> {
    const { s, r, v } = await this.ledger.signTransaction(
      "44'/60'/0'/0/0",
      tx.serialize()
    );
    return `0x${r}${s}${v}`;
  }
}