import { HDWallet, generateSeed } from './hd-wallet';

describe('HDWallet', () => {
  it('should generate a master key from a seed phrase', () => {
    const seed = Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex');
    const wallet = new HDWallet(seed);
    expect(wallet.masterKey.toBase58()).toBe('xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi');
  });

  it('should generate an address from a derivation path', () => {
    const seed = Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex');
    const wallet = new HDWallet(seed);
    const address = wallet.getAddress("m/44'/60'/0'/0/0");
    expect(address).toBe('0x8Ab21C659C5D9c7B4d66f3E7a7a8c3B9F0bD0eD2');
  });

  it('should generate a new random seed phrase', () => {
    const seed = generateSeed();
    expect(seed.length).toBeGreaterThan(0);
  });
});