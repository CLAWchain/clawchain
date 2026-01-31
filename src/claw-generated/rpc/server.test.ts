import { RPCServer } from './server';
import { Account } from '../state/account';

describe('RPCServer', () => {
  let server: RPCServer;
  let accounts: Account[];

  beforeEach(() => {
    accounts = [
      {
        publicKey: 'abc123',
        lamports: 100,
        owner: new Uint8Array([1, 2, 3]),
        executable: true
      },
      {
        publicKey: 'def456',
        lamports: 50,
        owner: new Uint8Array([4, 5, 6]),
        executable: false
      }
    ];
    const txnProcessor = { processTransaction: jest.fn() };
    server = new RPCServer(accounts, txnProcessor);
  });

  describe('getAccountInfo', () => {
    it('should return account info for a valid pubkey', async () => {
      const accountInfo = await server.getAccountInfo('abc123');
      expect(accountInfo).toEqual({
        lamports: 100,
        owner: '1,2,3',
        executable: true
      });
    });

    it('should throw an error for an invalid pubkey', async () => {
      await expect(server.getAccountInfo('invalid')).rejects.toThrow('Account not found: invalid');
    });
  });
});