import { getAccountInfo } from './get_account_info';
import { Account } from '../state/account';

jest.mock('../state/account', () => ({
  Account: {
    get: jest.fn()
  }
}));

describe('getAccountInfo', () => {
  it('should return account info', async () => {
    (Account.get as jest.Mock).mockResolvedValue({
      lamports: 1000,
      owner: 'owner_pubkey',
      executable: true
    });

    const accountInfo = await getAccountInfo('test_pubkey');
    expect(accountInfo).toEqual({
      lamports: 1000,
      owner: 'owner_pubkey',
      executable: true
    });
  });

  it('should throw error if account not found', async () => {
    (Account.get as jest.Mock).mockResolvedValue(null);
    await expect(getAccountInfo('test_pubkey')).rejects.toThrow('Account not found: test_pubkey');
  });
});