import { getBalance } from './rpc';

describe('RPC Methods', () => {
  it('should get account balance', async () => {
    const balance = await getBalance('12345678901234567890123456789012');
    expect(balance).toBeGreaterThanOrEqual(0);
  });
});