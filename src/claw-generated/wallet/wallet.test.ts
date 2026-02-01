// src/claw-generated/wallet/wallet.test.ts

import { Wallet } from './index';

describe('Wallet', () => {
  it('should generate a new wallet with a random seed phrase', () => {
    const wallet = new Wallet();
    expect(wallet.getSeedPhrase().split(' ')).toHaveLength(12);
    expect(wallet.getPublicKey()).toHaveLength(32);
    expect(wallet.getPrivateKey()).toHaveLength(64);
    expect(wallet.getAddress().length).toBeGreaterThan(0);
  });

  it('should generate a wallet from a seed phrase', () => {
    const seedPhrase = 'abandon amount expire adjust cage candy arch gather drum buyer enemy junior emit';
    const wallet = new Wallet(seedPhrase);
    expect(wallet.getSeedPhrase()).toBe(seedPhrase);
    expect(wallet.getPublicKey()).toHaveLength(32);
    expect(wallet.getPrivateKey()).toHaveLength(64);
    expect(wallet.getAddress().length).toBeGreaterThan(0);
  });
});