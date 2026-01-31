import { BIP32Interface, fromSeed } from 'bip32';
import { fromMasterSeed } from 'bip39';
import { ECPair, networks } from 'bitcoinjs-lib';

export class HDWallet {
  private masterKey: BIP32Interface;

  constructor(seed: Buffer) {
    this.masterKey = fromSeed(seed, networks.bitcoin);
  }

  derivePath(path: string): BIP32Interface {
    return this.masterKey.derivePath(path);
  }

  getAddress(index: number): string {
    const childKey = this.derivePath(`m/44'/0'/0'/0/${index}`);
    const keyPair = ECPair.fromPrivateKey(childKey.privateKey!);
    return keyPair.toAddress();
  }
}