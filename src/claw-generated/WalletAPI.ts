import { Wallet } from './Wallet';

export class WalletAPI {
  private wallet: Wallet;

  constructor(wallet: Wallet) {
    this.wallet = wallet;
  }

  async connectHardwareWallet(type: 'ledger' | 'trezor'): Promise<void> {
    await this.wallet.connectHardwareWallet(type);
  }

  async signTransaction(tx: Transaction): Promise<string> {
    return await this.wallet.signTransaction(tx);
  }

  // Other wallet API methods
}