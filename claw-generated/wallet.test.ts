import { Wallet } from './wallet';

describe('Wallet', () => {
  it('should generate a valid keypair from a mnemonic', () => {
    const mnemonic = 'abandon amount expire adjust cage candy arch gather drum buyer index expire adjust';
    const wallet = Wallet.generateFromMnemonic(mnemonic);

    expect(wallet.getPrivateKey().length).toEqual(32);
    expect(wallet.getPublicKey().length).toEqual(32);
    expect(wallet.getAddress().length).toBeGreaterThan(0);
  });

  it('should generate the same keypair from the same mnemonic', () => {
    const mnemonic = 'abandon amount expire adjust cage candy arch gather drum buyer index expire adjust';
    const wallet1 = Wallet.generateFromMnemonic(mnemonic);
    const wallet2 = Wallet.generateFromMnemonic(mnemonic);

    expect(wallet1.getPrivateKey()).toEqual(wallet2.getPrivateKey());
    expect(wallet1.getPublicKey()).toEqual(wallet2.getPublicKey());
    expect(wallet1.getAddress()).toEqual(wallet2.getAddress());
  });
});