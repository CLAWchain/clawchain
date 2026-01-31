import { RPC_METHODS } from './methods';
import { AccountState } from '../state/account';

jest.mock('../state/account', () => ({
  AccountState: {
    get: jest.fn().mockReturnValue({ balance: 1000 }),
  },
}));

describe('RPC Methods', () => {
  it('should return the correct balance', () => {
    const balance = RPC_METHODS.getBalance('0x123456789');
    expect(balance.balance).toBe(1000);
    expect(AccountState.get).toHaveBeenCalledWith('0x123456789');
  });
});