import * as ed25519 from 'ed25519-hd-key';
import * as bip39 from 'bip39';
import { base58 } from 'bs58';

export class Wallet {
  private static readonly DERIVATION_PATH = "m/44'/60'/0'/0/0";

  public static generateKeyPair(seed?: Uint8Array): { publicKey: Uint8Array; privateKey: Uint8Array } {
    if (seed) {
      const { key } = ed25519.derivePath(this.DERIVATION_PATH, seed);
      return { publicKey: key.slice(32), privateKey: key };
    } else {
      const mnemonic = bip39.generateMnemonic();
      const seed = bip39.mnemonicToSeedSync(mnemonic);
      const { key } = ed25519.derivePath(this.DERIVATION_PATH, seed);
      return { publicKey: key.slice(32), privateKey: key };
    }
  }

  public static deriveAddress(publicKey: Uint8Array): string {
    return base58.encode(publicKey);
  }
}