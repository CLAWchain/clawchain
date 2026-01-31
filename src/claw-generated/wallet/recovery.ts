import * as bip39 from 'bip39';
import * as nacl from 'tweetnacl';

export function generateSeedPhrase(): string {
  return bip39.generateMnemonic();
}

export function recoverKeyPair(seedPhrase: string): { publicKey: Uint8Array; secretKey: Uint8Array } {
  const seed = bip39.mnemonicToSeedSync(seedPhrase);
  const keypair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));
  return keypair;
}