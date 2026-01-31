import * as bip39 from 'bip39';
import * as ed25519 from 'ed25519-hd-key';
import * as base58 from 'bs58';

export class Wallet {
  private readonly seed: Buffer;
  private readonly keypair: {
    publicKey: Buffer;
    privateKey: Buffer;
  };

  constructor(seedPhrase?: string) {
    if (seedPhrase) {
      this.seed = bip39.mnemonicToSeedSync(seedPhrase);
    } else {
      this.seed = bip39.generateMnemonic().then(bip39.mnemonicToSeedSync);
    }

    const { publicKey, privateKey } = ed25519.derivePath("m/44'/60'/0'/0/0", this.seed);
    this.keypair = { publicKey, privateKey };
  }

  getPublicKey(): string {
    return base58.encode(this.keypair.publicKey);
  }

  getPrivateKey(): string {
    return base58.encode(this.keypair.privateKey);
  }

  getAddress(): string {
    return base58.encode(this.keypair.publicKey.slice(0, 20));
  }
}