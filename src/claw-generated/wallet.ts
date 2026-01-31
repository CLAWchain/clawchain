import { HDKey } from 'hdkey';

export class Wallet {
  private hdKey: HDKey;

  constructor(seed: Buffer) {
    this.hdKey = HDKey.fromMasterSeed(seed);
  }

  getAddress(index: number): string {
    const childKey = this.hdKey.derive(`m/44'/60'/0'/0/${index}`);
    return childKey.publicKey.toString('hex');
  }
}