import * as crypto from 'crypto';
import * as bip39 from 'bip39';
import * as nacl from 'tweetnacl';
import * as bs58 from 'bs58';

export interface Keypair {
  publicKey: string;
  privateKey: string;
}

export function generateKeypair(): Keypair {
  const seed = crypto.randomBytes(32);
  const keyPair = nacl.sign.keyPair.fromSeed(seed);

  return {
    publicKey: bs58.encode(Buffer.from(keyPair.publicKey)),
    privateKey: bs58.encode(Buffer.from(keyPair.secretKey)),
  };
}

export function recoverKeypairFromSeedPhrase(seedPhrase: string): Keypair {
  const seed = bip39.mnemonicToSeedSync(seedPhrase);
  const keyPair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));

  return {
    publicKey: bs58.encode(Buffer.from(keyPair.publicKey)),
    privateKey: bs58.encode(Buffer.from(keyPair.secretKey)),
  };
}