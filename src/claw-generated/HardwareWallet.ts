import { Wallet } from '../wallet/Wallet';

export class HardwareWallet extends Wallet {
  private transport: USBTransportInterface;

  constructor(transport: USBTransportInterface) {
    super();
    this.transport = transport;
  }

  async signTransaction(tx: Transaction): Promise<string> {
    // Use transport to sign the transaction on the hardware device
    const signature = await this.transport.signTransaction(tx);
    return signature;
  }

  // Other hardware wallet methods, e.g., getPublicKey, etc.
}