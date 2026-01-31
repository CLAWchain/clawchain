import { sendTransaction } from './handlers';
import { Transaction } from '../types';

describe('sendTransaction', () => {
  it('should process a valid transaction', async () => {
    const rawTransaction = 'ABC123DEF456';
    jest.spyOn(Transaction, 'fromBase64').mockReturnValue(new Transaction(rawTransaction));
    jest.spyOn(Transaction.prototype, 'validate').mockResolvedValue(undefined);
    jest.spyOn(Transaction.prototype, 'submit').mockResolvedValue(undefined);

    const transactionHash = await sendTransaction(rawTransaction);
    expect(transactionHash).toBe('0x1234567890abcdef');
    expect(Transaction.fromBase64).toHaveBeenCalledWith(rawTransaction);
    expect(Transaction.prototype.validate).toHaveBeenCalled();
    expect(Transaction.prototype.submit).toHaveBeenCalled();
  });

  it('should throw an error for an invalid transaction', async () => {
    const rawTransaction = 'ABC123DEF456';
    jest.spyOn(Transaction, 'fromBase64').mockReturnValue(new Transaction(rawTransaction));
    jest.spyOn(Transaction.prototype, 'validate').mockRejectedValue(new Error('Invalid transaction'));

    await expect(sendTransaction(rawTransaction)).rejects.toThrow('Invalid transaction');
    expect(Transaction.fromBase64).toHaveBeenCalledWith(rawTransaction);
    expect(Transaction.prototype.validate).toHaveBeenCalled();
    expect(Transaction.prototype.submit).not.toHaveBeenCalled();
  });
});