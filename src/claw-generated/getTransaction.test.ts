import { getTransaction } from './getTransaction';
import { Transaction } from '../chain/transaction';

jest.mock('../chain/transaction', () => ({
  Transaction: {
    getBySignature: jest.fn()
  }
}));

describe('getTransaction', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the transaction if found', async () => {
    const transactionSignature = 'abc123';
    const mockTransaction = { id: transactionSignature, blockHeight: 100 };
    (Transaction.getBySignature as jest.Mock).mockResolvedValue(mockTransaction);

    const result = await getTransaction(transactionSignature);
    expect(result).toEqual(mockTransaction);
    expect(Transaction.getBySignature).toHaveBeenCalledWith(transactionSignature);
  });

  it('should return null if transaction not found', async () => {
    const transactionSignature = 'abc123';
    (Transaction.getBySignature as jest.Mock).mockResolvedValue(null);

    const result = await getTransaction(transactionSignature);
    expect(result).toBeNull();
    expect(Transaction.getBySignature).toHaveBeenCalledWith(transactionSignature);
  });
});