import { HardwareWalletProvider } from './HardwareWalletProvider';
import { LedgerProvider } from './LedgerProvider';
import { TrezorProvider } from './TrezorProvider';

export class WalletManager {
  private providers: HardwareWalletProvider[] = [
    new LedgerProvider(),
    new TrezorProvider(),
  ];

  async signTransaction(txData: any): Promise<string> {
    for (const provider of this.providers) {
      try {
        return await provider.signTransaction(txData);
      } catch (err) {
        console.error(`Error signing with ${provider.name}: ${err.message}`);
      }
    }
    throw new Error('Failed to sign transaction with any hardware wallet provider');
  }
}