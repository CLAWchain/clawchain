import { HDWallet } from './hdwallet';
import { fromMasterSeed } from 'bip39';

describe('HDWallet', () => {
  test('should derive addresses correctly', () => {
    const seed = fromMasterSeed('abandon amount expire adjust cage candy arch gather drum buyer index generator chief');
    const wallet = new HDWallet(seed);

    expect(wallet.getAddress(0)).toBe('1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1T');
    expect(wallet.getAddress(1)).toBe('1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1T');
  });
});