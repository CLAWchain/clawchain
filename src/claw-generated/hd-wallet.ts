import { bip32, crypto, networks } from 'bitcoinjs-lib';

export class HDWallet {
  private masterKey: bip32.BIP32Interface;

  constructor(seed: Buffer) {
    this.masterKey = bip32.fromSeed(seed, networks.bitcoin);
  }

  // Generate a child key at the specified derivation path
  getChildKey(path: string): bip32.BIP32Interface {
    return this.masterKey.derivePath(path);
  }

  // Generate a public key from a child key
  getPublicKey(childKey: bip32.BIP32Interface): string {
    return childKey.publicKey.toString('hex');
  }

  // Generate an address from a public key
  getAddress(publicKey: string): string {
    const { address } = crypto.payments.p2pkh({ pubkey: Buffer.from(publicKey, 'hex') });
    return address!;
  }
}