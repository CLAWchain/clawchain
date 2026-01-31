import { getBalance } from './getBalance';
import { Account } from '../state/account';

jest.mock('../state/account', () => ({
  Account: {
    get: jest.fn(),
  },
}));

describe('RPC methods', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should return the account balance', async () => {
      const mockAccount = { balance: 100 };
      (Account.get as jest.Mock).mockResolvedValue(mockAccount);

      const balance = await getBalance('0x123456789');
      expect(balance).toBe(100);
      expect(Account.get).toHaveBeenCalledWith('0x123456789');
    });
  });
});