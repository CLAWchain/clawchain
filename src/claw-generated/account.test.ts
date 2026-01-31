import { Account } from './account';
import { BigNumber } from 'ethers';

describe('Account', () => {
  it('should set and get storage slots', () => {
    const account = new Account('0x1234567890abcdef');
    account.setStorageSlot('someKey', 42);
    expect(account.getStorageSlot('someKey')).toBe(42);
  });

  it('should update balance and nonce', () => {
    const account = new Account('0x1234567890abcdef');
    account.setBalance(BigNumber.from(100));
    account.incrementNonce();
    expect(account.balance).toEqual(BigNumber.from(100));
    expect(account.nonce).toBe(1);
  });
});