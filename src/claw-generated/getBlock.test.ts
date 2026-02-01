import { getBlock } from './getBlock';
import { ChainStore } from '../store/ChainStore';

jest.mock('../store/ChainStore', () => ({
  ChainStore: {
    getBlock: jest.fn()
  }
}));

describe('getBlock', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return block data', async () => {
    const mockBlock = {
      slot: 100,
      timestamp: 1234567890,
      transactions: [
        { signature: 'tx1' },
        { signature: 'tx2' }
      ]
    };
    (ChainStore.getBlock as jest.Mock).mockResolvedValue(mockBlock);

    const result = await getBlock({ slot: 100, includeTransactions: true });
    expect(result).toEqual({
      slot: 100,
      timestamp: 1234567890,
      transactions: [
        { signature: 'tx1' },
        { signature: 'tx2' }
      ]
    });
    expect(ChainStore.getBlock).toHaveBeenCalledWith(100);
  });

  it('should throw an error if block not found', async () => {
    (ChainStore.getBlock as jest.Mock).mockResolvedValue(null);
    await expect(getBlock({ slot: 100 })).rejects.toThrow('Block not found for slot 100');
  });
});