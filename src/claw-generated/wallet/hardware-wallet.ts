import { Transaction } from '../transaction/transaction';
import { Wallet } from './wallet';
import Transport from '@ledgerhq/hw-transport-node-hid';
import Eth from '@ledgerhq/hw-app-eth';
import { TransactionType } from '../transaction/types';

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
    try {
      this.transport = await Transport.create();
      this.ethApp = new Eth(this.transport);
    } catch (error) {
      console.error('Error connecting to hardware wallet:', error);
      throw error;
    }
  }

  /**
   * Sign a transaction using the hardware wallet.
   * @param transaction The transaction to sign.
   * @returns The signed transaction.
   */
  async signTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      let signature;
      switch (transaction.type) {
        case TransactionType.ERC20:
          signature = await this.signERC20Transaction(transaction);
          break;
        case TransactionType.ERC721:
          signature = await this.signERC721Transaction(transaction);
          break;
        case TransactionType.ClawChain:
          signature = await this.signClawChainTransaction(transaction);
          break;
        default:
          throw new Error(`Unsupported transaction type: ${transaction.type}`);
      }

      transaction.r = signature.r;
      transaction.s = signature.s;
      transaction.v = signature.v;

      return transaction;
    } catch (error) {
      console.error('Error signing transaction with hardware wallet:', error);
      // Fallback to software-based signing
      return await this.wallet.signTransaction(transaction);
    }
  }

  private async signERC20Transaction(transaction: Transaction): Promise<{ r: string; s: string; v: number }> {
    return this.ethApp.signTransaction(
      "44'/60'/0'/0/0",
      transaction.serialize()
    );
  }

  private async signERC721Transaction(transaction: Transaction): Promise<{ r: string; s: string; v: number }> {
    return this.ethApp.signTransaction(
      "44'/60'/0'/0/0",
      transaction.serialize()
    );
  }

  private async signClawChainTransaction(transaction: Transaction): Promise<{ r: string; s: string; v: number }> {
    // Implement ClawChain-specific signing logic here
    throw new Error('ClawChain transaction signing not yet implemented');
  }

  /**
   * Disconnect from the hardware wallet device.
   */
  async disconnect(): Promise<void> {
    try {
      await this.transport.close();
    } catch (error) {
      console.error('Error disconnecting from hardware wallet:', error);
    }
  }
}