// src/claw-generated/wallet/trezor.ts

import { HardwareWalletTransport, WalletAccount } from './hardware';
import TrezorConnect from 'trezor-connect';

export class TrezorTransport implements HardwareWalletTransport {
  async connect(): Promise<void> {
    await TrezorConnect.init({
      manifest: {
        email: 'your@email.com',
        appUrl: 'https://your-app.com',
      },
    });
  }

  async disconnect(): Promise<void> {
    await TrezorConnect.dispose();
  }

  async getAccounts(): Promise<WalletAccount[]> {
    const { payload } = await TrezorConnect.getPublicKey({
      path: "m/44'/60'/0'/0",
      coin: 'eth',
    });
    return [
      {
        address: payload.address,
        publicKey: payload.publicKey,
      },
    ];
  }

  async signTransaction(account: WalletAccount, transaction: any): Promise<any> {
    const { payload } = await TrezorConnect.ethereumSignTransaction({
      path: "m/44'/60'/0'/0/0",
      transaction,
    });
    return payload.signature;
  }
}