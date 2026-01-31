// src/claw-generated/wallet/wallet.test.ts
import { Wallet } from './index';

describe('Wallet', () => {
  it('should generate a random wallet', () => {
    const wallet = Wallet.generateRandomWallet();
    expect(wallet.privateKey).toBeInstanceOf(Buffer);
    expect(wallet.publicKey).toBeInstanceOf(Buffer);
    expect(wallet.address).toMatch(/^[1-9A-HJ-NP-Za-km-z]+$/);
  });

  it('should generate a wallet from a seed', () => {
    const seed = Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex');
    const wallet = Wallet.generateFromSeed(seed);
    expect(wallet.privateKey).toEqual(seed);
    expect(wallet.publicKey).toEqual(Buffer.from('3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29', 'hex'));
    expect(wallet.address).toBe('16UwLL9Risc3QfPqBUvKofHmBQ7wMtjvM');
  });
});