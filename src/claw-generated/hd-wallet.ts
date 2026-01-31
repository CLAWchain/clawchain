import { BIP32Interface, fromSeed } from 'bip32';
import { fromMasterSeed } from 'bip39';
import { ECPairInterface, ECPairFactory } from 'ecpair';

export class HDWallet {
  private masterKey: BIP32Interface;
  private ecPair: ECPairInterface;

  constructor(seed: Buffer) {
    this.masterKey = fromSeed(seed);
    this.ecPair = ECPairFactory.fromMasterKey(this.masterKey);
  }

  getAddress(index: number): string {
    const childKey = this.masterKey.derive(index);
    const { address } = childKey.toWIF();
    return address;
  }
}