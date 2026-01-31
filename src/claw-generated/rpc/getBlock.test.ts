import { getBlock, GetBlockParams } from './getBlock';
import { Chain } from '../blockchain/Chain';
import { Block } from '../block/block';
import { TransactionReceipt } from '../transaction/TransactionReceipt';

jest.mock('../blockchain/Chain');

describe('getBlock RPC method', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a block by slot number', async () => {
    const mockBlock = { slot: 123, transactionIds: ['tx1', 'tx2'] } as Block;
    (Chain.instance.getBlockBySlot as jest.Mock).mockResolvedValue(mockBlock);

    const params: GetBlockParams = { slot: 123 };
    const result = await getBlock(params);
    expect(result).toEqual(mockBlock);
    expect(Chain.instance.getBlockBySlot).toHaveBeenCalledWith(123);
  });

  it('should return null if block not found', async () => {
    (Chain.instance.getBlockBySlot as jest.Mock).mockResolvedValue(null);

    const params: GetBlockParams = { slot: 456 };
    const result = await getBlock(params);
    expect(result).toBeNull();
    expect(Chain.instance.getBlockBySlot).toHaveBeenCalledWith(456);
  });

  it('should include transaction details when requested', async () => {
    const mockBlock = { slot: 123, transactionIds: ['tx1', 'tx2'] } as Block;
    const mockTx1 = { id: 'tx1' };
    const mockTx2 = { id: 'tx2' };
    const mockReceipt = { status: 'success' } as TransactionReceipt;
    (Chain.instance.getBlockBySlot as jest.Mock).mockResolvedValue(mockBlock);
    (Chain.instance.getTransaction as jest.Mock)
      .mockResolvedValueOnce(mockTx1)
      .mockResolvedValueOnce(mockTx2);
    (Chain.instance.getTransactionReceipt as jest.Mock).mockResolvedValue(mockReceipt);

    const params: GetBlockParams = { slot: 123, includeTransactions: true };
    const result = await getBlock(params);
    expect(result?.transactions).toEqual([
      { ...mockTx1, receipt: mockReceipt },
      { ...mockTx2, receipt: mockReceipt },
    ]);
    expect(Chain.instance.getTransaction).toHaveBeenCalledTimes(2);
    expect(Chain.instance.getTransactionReceipt).toHaveBeenCalledTimes(2);
  });

  it('should serialize the block to binary format when requested', async () => {
    const mockBlock = { slot: 123, transactionIds: ['tx1', 'tx2'], serialize: jest.fn() } as Block;
    (Chain.instance.getBlockBySlot as jest.Mock).mockResolvedValue(mockBlock);

    const params: GetBlockParams = { slot: 123, encoding: 'binary' };
    const result = await getBlock(params);
    expect(result).toEqual(mockBlock);
    expect(mockBlock.serialize).toHaveBeenCalled();
  });
});