import { getTransaction } from '../getTransaction';
import { db } from '../../db';

jest.mock('../../db');

describe('getTransaction', () => {
  it('should return a transaction', async () => {
    const mockTransaction = {
      signature: 'abc123',
      sender: '0x1234',
      recipient: '0x5678',
      amount: 100,
      timestamp: Date.now(),
    };

    (db.getTransaction as jest.Mock).mockResolvedValue(mockTransaction);

    const result = await getTransaction('abc123');
    expect(result).toEqual(mockTransaction);
  });

  it('should return null if transaction not found', async () => {
    (db.getTransaction as jest.Mock).mockResolvedValue(null);

    const result = await getTransaction('abc123');
    expect(result).toBeNull();
  });
});