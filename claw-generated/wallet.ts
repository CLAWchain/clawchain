import * as ed25519 from 'ed25519-hd-key';
import * as bip39 from 'bip39';
import bs58 from 'bs58';

export interface Keypair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export function generateKeypair(seed?: Uint8Array): Keypair {
  const { publicKey, privateKey } = ed25519.derivePath("m/44'/60'/0'/0/0", seed || crypto.getRandomValues(new Uint8Array(32)));
  return { publicKey, privateKey };
}

export function getAddressFromPublicKey(publicKey: Uint8Array): string {
  return bs58.encode(publicKey);
}

export function getKeypairFromSeedPhrase(seedPhrase: string): Keypair {
  const seed = bip39.mnemonicToSeedSync(seedPhrase);
  return generateKeypair(seed);
}