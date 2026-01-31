import * as bip39 from 'bip39';
import * as ed25519 from 'ed25519-hd-key';
import * as base58 from 'bs58';

export class Keypair {
  private readonly privateKey: Buffer;
  private readonly publicKey: Buffer;

  constructor(privateKey: Buffer) {
    this.privateKey = privateKey;
    this.publicKey = ed25519.derivePubKey(privateKey);
  }

  get address(): string {
    return base58.encode(this.publicKey);
  }

  static fromSeedPhrase(seedPhrase: string): Keypair {
    const seed = bip39.mnemonicToSeedSync(seedPhrase);
    const { key } = ed25519.deriveMasterKey(seed);
    return new Keypair(key);
  }

  static generate(): Keypair {
    const privateKey = ed25519.createPrivateKey();
    return new Keypair(privateKey);
  }
}