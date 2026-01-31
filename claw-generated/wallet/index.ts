import { HardwareWallet } from './hardware';

export class Wallet {
  private hardwareWallet: HardwareWallet;

  constructor() {
    this.hardwareWallet = new HardwareWallet();
  }

  async signTransaction(transaction: any): Promise&lt;string&gt; {
    return this.hardwareWallet.signTransaction(transaction);
  }
}