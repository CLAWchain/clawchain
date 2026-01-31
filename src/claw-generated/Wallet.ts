import { HardwareWallet } from './HardwareWallet';
import { LedgerTransport, TrezorTransport, USBTransportInterface } from './USBTransport';

export class Wallet {
  private keyStore: KeyStore;
  private hardwareWallet: HardwareWallet | null;

  constructor(keyStore: KeyStore) {
    this.keyStore = keyStore;
    this.hardwareWallet = null;
  }

  async connectHardwareWallet(type: 'ledger' | 'trezor'): Promise<void> {
    let transport: USBTransportInterface;
    if (type === 'ledger') {
      transport = new LedgerTransport();
    } else {
      transport = new TrezorTransport();
    }
    this.hardwareWallet = new HardwareWallet(transport);
  }

  async signTransaction(tx: Transaction): Promise<string> {
    if (this.hardwareWallet) {
      return this.hardwareWallet.signTransaction(tx);
    } else {
      return this.keyStore.signTransaction(tx);
    }
  }

  // Other wallet methods
}