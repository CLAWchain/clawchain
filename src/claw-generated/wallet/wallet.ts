import { ECDSASignatureScheme } from './signing';

export class WalletService {
  private signatureScheme: ECDSASignatureScheme;

  constructor() {
    this.signatureScheme = new ECDSASignatureScheme();
  }

  async connectWallet(): Promise<string> {
    // Connect to user's wallet and return the connected account address
    const { publicKey } = this.signatureScheme.generateKeyPair();
    return publicKey.toString('hex');
  }

  async switchAccount(newAccount: string): Promise<void> {
    // Switch to the new account
    // (e.g., notify the application of the account change)
  }
}