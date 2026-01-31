import { mnemonicToSeedSync } from 'bip39';
import { hdkey } from 'hdkey';

export class HDWallet {
  private masterKey: hdkey;

  constructor(mnemonic: string) {
    const seed = mnemonicToSeedSync(mnemonic);
    this.masterKey = hdkey.fromMasterSeed(seed);
  }

  deriveChild(path: string): hdkey {
    return this.masterKey.derive(path);
  }

  getAddress(path: string): string {
    const childKey = this.deriveChild(path);
    return childKey.publicKey.toString('hex');
  }
}