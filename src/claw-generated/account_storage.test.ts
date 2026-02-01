import { AccountStorage } from './account_storage';
import { Account } from './types';

describe('AccountStorage', () => {
  let accountStorage: AccountStorage;

  beforeEach(() => {
    accountStorage = new AccountStorage();
  });

  it('should create a new account', () => {
    const account = accountStorage.getAccount('0x1234');
    expect(account.address).toBe('0x1234');
    expect(account.state.size).toBe(0);
  });

  it('should set and get account state', () => {
    const account = accountStorage.getAccount('0x1234');
    accountStorage.setAccountState('0x1234', 'balance', 100);
    expect(account.state.get('balance')).toBe(100);
  });
});