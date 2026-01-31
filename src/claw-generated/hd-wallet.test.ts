import { HDWallet } from './hd-wallet';

describe('HDWallet', () => {
  it('should derive child keys correctly', () => {
    const mnemonic = 'abandon amount expire adjust cage candy arch gather drum buyer index expire adjust';
    const wallet = new HDWallet(mnemonic);

    const address0 = wallet.getAddress("m/44'/60'/0'/0/0");
    expect(address0).toBe('0x8f34e34932234f23f2f2f2f2f2f2f2f2f2f2f2f2f2');

    const address1 = wallet.getAddress("m/44'/60'/0'/0/1");
    expect(address1).toBe('0xf2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2');
  });
});