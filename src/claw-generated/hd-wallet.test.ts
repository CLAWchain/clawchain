import { HDWallet } from './hd-wallet';
import { bip32, crypto } from 'bitcoinjs-lib';

describe('HDWallet', () => {
  const seedPhrase = 'abandon amount expire adjust cage candy arch gather drum buyer enemy junior consist';
  const seed = Buffer.from(seedPhrase.split(' ').join(''), 'hex');

  it('should generate child keys correctly', () => {
    const wallet = new HDWallet(seed);
    const childKey = wallet.getChildKey("m/44'/0'/0'/0/0");
    expect(childKey.publicKey.toString('hex')).toEqual('03c94edaa0c5c7abee5d36c7c477d8ebc9278ba90c5f9c162a0b8e4c4b32fa27b');
  });

  it('should generate public keys correctly', () => {
    const wallet = new HDWallet(seed);
    const childKey = wallet.getChildKey("m/44'/0'/0'/0/0");
    const publicKey = wallet.getPublicKey(childKey);
    expect(publicKey).toEqual('03c94edaa0c5c7abee5d36c7c477d8ebc9278ba90c5f9c162a0b8e4c4b32fa27b');
  });

  it('should generate addresses correctly', () => {
    const wallet = new HDWallet(seed);
    const childKey = wallet.getChildKey("m/44'/0'/0'/0/0");
    const publicKey = wallet.getPublicKey(childKey);
    const address = wallet.getAddress(publicKey);
    expect(address).toEqual('1PuKMvRFfwbLXyEvDQkJFZ19wgRFAMUVXM');
  });
});