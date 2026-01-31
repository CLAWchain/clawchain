import { BIP32Factory, fromSeed } from 'bip32';
import { fromSeedSync } from 'bip39';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);
const ecPair = ECPairFactory(ecc);

export function generateMasterKey(seed: Buffer): Buffer {
  const masterKey = fromSeedSync(seed, bip32.BITCOIN_NETWORK);
  return masterKey.privateKey!;
}

export function deriveChildKey(masterKey: Buffer, account: number, change: number, index: number): Buffer {
  const masterNode = bip32.fromPrivateKey(masterKey);
  const childNode = masterNode.derive(44, true) // BIP44 purpose
             .derive(account, true) // account
             .derive(change, false) // change (0=external, 1=internal)
             .derive(index);
  return childNode.privateKey!;
}

export function generateAddress(childKey: Buffer): string {
  const keyPair = ecPair.fromPrivateKey(childKey);
  return keyPair.toPublicKey().toString('hex');
}