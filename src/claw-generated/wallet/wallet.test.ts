// src/claw-generated/wallet/wallet.test.ts

import { Wallet } from './index';

describe('Wallet', () => {
  it('should generate a valid keypair from a seed phrase', () => {
    const seed = 'abandon amount expire adjust cage candy arch gather drum buyer index expire adjust';
    const wallet = new Wallet(seed);

    expect(wallet.privateKey.length).toBe(32);
    expect(wallet.publicKey.length).toBe(32);
    expect(wallet.address.length).toBeGreaterThan(0);
  });

  it('should derive the same keypair from the same seed phrase', () => {
    const seed = 'abandon amount expire adjust cage candy arch gather drum buyer index expire adjust';
    const wallet1 = new Wallet(seed);
    const wallet2 = new Wallet(seed);

    expect(wallet1.privateKey).toEqual(wallet2.privateKey);
    expect(wallet1.publicKey).toEqual(wallet2.publicKey);
    expect(wallet1.address).toEqual(wallet2.address);
  });
});