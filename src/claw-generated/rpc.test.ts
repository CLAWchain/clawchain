import { rpcMethods } from './rpc';
import { Transaction } from '../types';
import { broadcastTransaction } from '../network';

jest.mock('../network', () => ({
  broadcastTransaction: jest.fn().mockResolvedValue('0x123456789abcdef'),
}));

describe('rpcMethods', () => {
  describe('sendTransaction', () => {
    it('should process a valid signed transaction', async () => {
      // Mock a valid transaction
      const validTransaction = new Transaction({
        signatures: ['0x123456789abcdef'],
        instructions: [],
      });
      const validTransactionBase64 = validTransaction.serialize().toString('base64');

      const result = await rpcMethods.sendTransaction(validTransactionBase64);
      expect(result).toBe('0x123456789abcdef');
      expect(broadcastTransaction).toHaveBeenCalledWith(validTransaction);
    });

    it('should throw an error for an invalid transaction', async () => {
      // Mock an invalid transaction
      const invalidTransaction = new Transaction({
        signatures: [],
        instructions: [],
      });
      const invalidTransactionBase64 = invalidTransaction.serialize().toString('base64');

      await expect(rpcMethods.sendTransaction(invalidTransactionBase64)).rejects.toThrow('Invalid transaction signatures');
      expect(broadcastTransaction).not.toHaveBeenCalled();
    });
  });
});