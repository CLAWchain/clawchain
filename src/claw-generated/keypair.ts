import * as ed25519 from 'ed25519-hd-key';
import * as bip39 from 'bip39';
import * as bs58 from 'bs58';

export class Keypair {
  private readonly privateKey: Uint8Array;
  private readonly publicKey: Uint8Array;
  private readonly address: string;

  constructor(privateKey: Uint8Array) {
    this.privateKey = privateKey;
    this.publicKey = ed25519.getPublicKey(privateKey);
    this.address = bs58.encode(this.publicKey);
  }

  static fromSeedPhrase(seedPhrase: string): Keypair {
    const seed = bip39.mnemonicToSeedSync(seedPhrase);
    const masterKey = ed25519.derivePath("m/44'/60'/0'/0/0", seed.toString('hex')).key;
    return new Keypair(masterKey);
  }
}