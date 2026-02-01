import * as ed25519 from 'ed25519-hd-key';
import * as bip39 from 'bip39';
import { toBase58 } from 'bs58';

export class Keypair {
  private _publicKey: Uint8Array;
  private _privateKey: Uint8Array;

  constructor(publicKey: Uint8Array, privateKey: Uint8Array) {
    this._publicKey = publicKey;
    this._privateKey = privateKey;
  }

  get publicKey(): Uint8Array {
    return this._publicKey;
  }

  get privateKey(): Uint8Array {
    return this._privateKey;
  }

  get address(): string {
    return toBase58(this._publicKey);
  }
}

export function generateKeypair(seedPhrase?: string): Keypair {
  let seed: Uint8Array;
  if (seedPhrase) {
    seed = ed25519.getMasterKeyFromSeed(bip39.mnemonicToSeedSync(seedPhrase));
  } else {
    seed = ed25519.getMasterKeyFromSeed(bip39.generateMnemonic().split(' '));
  }

  const { key: privateKey } = ed25519.derivePath("m/44'/60'/0'/0/0", seed);
  const publicKey = ed25519.getPublicKey(privateKey);

  return new Keypair(publicKey, privateKey);
}