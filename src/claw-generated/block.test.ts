import { Blockchain } from './blockchain';
import { Transaction } from './transaction';

describe('Blockchain', () => {
  let blockchain: Blockchain;

  beforeEach(() => {
    blockchain = new Blockchain();
  });

  it('should validate block size', () => {
    // Create a large number of transactions to exceed the block size limit
    const transactions: Transaction[] = [];
    for (let i = 0; i < blockchain.maxBlockSize + 1; i++) {
      transactions.push(new Transaction());
    }

    // Try to mine a block with the large transaction set
    expect(() => blockchain.mineBlock()).toThrowError('Block size exceeds the limit');
  });

  it('should adjust block size limit', () => {
    const initialMaxBlockSize = blockchain.maxBlockSize;

    // Mine 10 blocks to trigger the block size adjustment
    for (let i = 0; i < 10; i++) {
      blockchain.mineBlock();
    }

    expect(blockchain.maxBlockSize).toBeGreaterThan(initialMaxBlockSize);
  });
});