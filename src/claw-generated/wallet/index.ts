// src/claw-generated/wallet/index.ts
import * as crypto from 'crypto';
import * as bip39 from 'bip39';
import * as ed25519 from 'ed25519-hd-key';
import { base58 } from 'base-x';

export interface Keypair {
  publicKey: string;
  privateKey: string;
}

export function generateKeypair(seed?: string): Keypair {
  let masterKey;
  if (seed) {
    masterKey = ed25519.deriveMaster(bip39.mnemonicToSeedSync(seed));
  } else {
    masterKey = ed25519.deriveMaster(crypto.randomBytes(32));
  }
  
  const { key: publicKey, chainCode: privateKey } = ed25519.derive(masterKey, "m/44'/60'/0'/0/0");
  return {
    publicKey: base58.encode(publicKey),
    privateKey: base58.encode(privateKey)
  };
}