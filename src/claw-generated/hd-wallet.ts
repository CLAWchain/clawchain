import { randomBytes } from 'crypto';
import { bip32, crypto, networks } from 'bitcoinjs-lib';

export class HDWallet {
  private masterKey: bip32.BIP32Interface;

  constructor(seed: Buffer) {
    this.masterKey = bip32.fromSeed(seed, networks.bitcoin);
  }

  // Generate an address from the given derivation path
  getAddress(path: string): string {
    const childKey = this.masterKey.derivePath(path);
    const { address } = crypto.payments.p2pkh({ pubkey: childKey.publicKey });
    return address!;
  }

  // Get the public key for the given derivation path
  getPublicKey(path: string): string {
    const childKey = this.masterKey.derivePath(path);
    return childKey.publicKey.toString('hex');
  }

  // Derive a child key from the master key
  getChildKey(path: string): bip32.BIP32Interface {
    return this.masterKey.derivePath(path);
  }
}

// Generate a new random seed phrase
export function generateSeed(): string {
  const seed = randomBytes(16);
  return bip32.toBase58(seed);
}