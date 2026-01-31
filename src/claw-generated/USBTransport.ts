import TransportU2F from '@ledgerhq/hw-transport-u2f';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import TrezorConnect from 'trezor-connect';

export interface USBTransportInterface {
  signTransaction(tx: Transaction): Promise<string>;
  getPublicKey(path: string): Promise<string>;
}

export class LedgerTransport implements USBTransportInterface {
  private transport: TransportU2F | TransportWebUSB;

  constructor() {
    // Initialize Ledger transport
    this.transport = TransportWebUSB.create();
  }

  async signTransaction(tx: Transaction): Promise<string> {
    // Use Ledger transport to sign the transaction
    const signature = await this.transport.signTransaction(tx);
    return signature;
  }

  async getPublicKey(path: string): Promise<string> {
    // Use Ledger transport to get public key
    const publicKey = await this.transport.getPublicKey(path);
    return publicKey;
  }
}

export class TrezorTransport implements USBTransportInterface {
  async signTransaction(tx: Transaction): Promise<string> {
    // Use Trezor Connect to sign the transaction
    const signature = await TrezorConnect.ethereumSignTransaction(tx);
    return signature;
  }

  async getPublicKey(path: string): Promise<string> {
    // Use Trezor Connect to get public key
    const publicKey = await TrezorConnect.ethereumGetPublicKey(path);
    return publicKey;
  }
}