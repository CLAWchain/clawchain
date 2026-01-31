import * as bip39 from 'bip39';
import * as ed25519 from 'ed25519-hd-key';
import * as bs58 from 'bs58';

/**
 * Generates an Ed25519 keypair from a BIP39 seed phrase.
 * @param seedPhrase The BIP39 seed phrase to derive the keypair from.
 * @returns An object containing the public key and private key in base58 format.
 */
export function generateKeypair(seedPhrase: string): { publicKey: string, privateKey: string } {
  const seed = bip39.mnemonicToSeedSync(seedPhrase);
  const { key: privateKey } = ed25519.derivePath("m/44'/60'/0'/0/0", seed.toString('hex'));
  const publicKey = ed25519.getPublicKey(privateKey);

  return {
    publicKey: bs58.encode(Buffer.from(publicKey)),
    privateKey: bs58.encode(Buffer.from(privateKey))
  };
}