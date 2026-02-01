import { MemoryStore } from './memory-store';
import { get_transaction } from './rpc_methods';
import { TransactionReceipt } from './transaction/TransactionReceipt';

describe('RPC Methods', () => {
  let memoryStore: MemoryStore;

  beforeEach(() => {
    memoryStore = new MemoryStore();
  });

  it('should get a transaction by signature', async () => {
    const signature = 'abc123';
    const tx: TransactionReceipt = {
      signature,
      sender: '0x123',
      receiver: '0x456',
      amount: 100,
      timestamp: Date.now()
    };
    await memoryStore.storeTransaction(tx);

    const result = await get_transaction(&memoryStore, signature);
    expect(result).toEqual(tx);
  });

  it('should return null if transaction not found', async () => {
    const result = await get_transaction(&memoryStore, 'invalid-signature');
    expect(result).toBeNull();
  });
});