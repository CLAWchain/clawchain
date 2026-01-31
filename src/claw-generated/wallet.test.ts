import { Wallet } from './wallet';

describe('Wallet', () => {
  it('should derive addresses correctly', () => {
    const seed = Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex');
    const wallet = new Wallet(seed);

    expect(wallet.getAddress(0)).toBe('b60fb2d7c9bb22d29f9c375a97e3e5d3');
    expect(wallet.getAddress(1)).toBe('4c1a4dd8c7d0cf1f0b72d7a4fce4a6cf');
    expect(wallet.getAddress(2)).toBe('7bbd54d5d5f2c0d0f8b21b6b0a6d3a79');
  });
});