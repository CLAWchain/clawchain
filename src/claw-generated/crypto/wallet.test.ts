import { Wallet } from './wallet';

describe('Wallet', () => {
  it('should generate a keypair from a mnemonic', () => {
    const mnemonic = 'abandon amount expire adjust cage candy arch gather drum buyer index expire adjust';
    const wallet = Wallet.generateFromMnemonic(mnemonic);

    expect(wallet.privateKey).toHaveLength(44);
    expect(wallet.publicKey).toHaveLength(44);
    expect(wallet.address).toHaveLength(35);
  });

  it('should derive the same keypair from the same seed', () => {
    const mnemonic = 'abandon amount expire adjust cage candy arch gather drum buyer index expire adjust';
    const wallet1 = Wallet.generateFromMnemonic(mnemonic);
    const wallet2 = Wallet.generateFromMnemonic(mnemonic);

    expect(wallet1.privateKey).toEqual(wallet2.privateKey);
    expect(wallet1.publicKey).toEqual(wallet2.publicKey);
    expect(wallet1.address).toEqual(wallet2.address);
  });
});