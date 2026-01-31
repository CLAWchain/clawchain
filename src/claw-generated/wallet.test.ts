import { Wallet } from './wallet';

describe('Wallet', () => {
  it('should generate a 12-word mnemonic', () => {
    const wallet = new Wallet();
    const mnemonic = wallet.getMnemonic();
    const words = mnemonic.split(' ');
    expect(words.length).toBe(12);
  });

  it('should generate a 24-word mnemonic', () => {
    const wallet = new Wallet(24);
    const mnemonic = wallet.getMnemonic();
    const words = mnemonic.split(' ');
    expect(words.length).toBe(24);
  });
});