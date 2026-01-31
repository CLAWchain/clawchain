import { HDWallet } from './bip32';

describe('HDWallet', () => {
  it('should generate the correct master key from a seed', () => {
    const seed = Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex');
    const wallet = new HDWallet(seed);
    expect(wallet.masterKey.toString('hex')).toEqual('90046a93de5380a72b5e45010748567d5ea02bbf6522f979e05c0d8d8ca9fffb');
  });

  it('should derive the correct child key', () => {
    const seed = Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex');
    const wallet = new HDWallet(seed);
    const childKey = wallet.derivePath("m/44'/60'/0'/0/0");
    expect(childKey.toString('hex')).toEqual('04e5ce5d7d36b9f0a6d0c2d5c3f5e5b2f1c5f7eed9f5d57e9f7c6a4fe2b7fcc1e');
  });
});