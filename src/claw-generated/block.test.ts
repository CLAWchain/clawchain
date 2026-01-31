import { Block } from '../blockchain/block';
import { Transaction } from '../blockchain/transaction';

describe('Block', () => {
  it('should create a new block', () => {
    const transactions: Transaction[] = [
      new Transaction({
        from: '0x1234567890abcdef',
        to: '0x0987654321fedcba',
        amount: 100,
        timestamp: 1618304400,
      }),
      new Transaction({
        from: '0xdeadbeef00000000',
        to: '0x00000000deadbeef',
        amount: 50,
        timestamp: 1618304401,
      }),
    ];

    const block = new Block({
      transactions,
      timestamp: 1618304500,
      parentHash: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    });

    expect(block.transactions).toEqual(transactions);
    expect(block.timestamp).toEqual(1618304500);
    expect(block.parentHash).toEqual('0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef');
  });

  it('should validate a block', () => {
    const validTransactions: Transaction[] = [
      new Transaction({
        from: '0x1234567890abcdef',
        to: '0x0987654321fedcba',
        amount: 100,
        timestamp: 1618304400,
      }),
      new Transaction({
        from: '0xdeadbeef00000000',
        to: '0x00000000deadbeef',
        amount: 50,
        timestamp: 1618304401,
      }),
    ];

    const invalidTransactions: Transaction[] = [
      new Transaction({
        from: '0x1234567890abcdef',
        to: '0x0987654321fedcba',
        amount: -100,
        timestamp: 1618304400,
      }),
    ];

    const validBlock = new Block({
      transactions: validTransactions,
      timestamp: 1618304500,
      parentHash: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    });

    const invalidBlock = new Block({
      transactions: [...validTransactions, ...invalidTransactions],
      timestamp: 1618304500,
      parentHash: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    });

    expect(validBlock.validate()).toBe(true);
    expect(invalidBlock.validate()).toBe(false);
  });

  it('should serialize and deserialize a block', () => {
    const transactions: Transaction[] = [
      new Transaction({
        from: '0x1234567890abcdef',
        to: '0x0987654321fedcba',
        amount: 100,
        timestamp: 1618304400,
      }),
      new Transaction({
        from: '0xdeadbeef00000000',
        to: '0x00000000deadbeef',
        amount: 50,
        timestamp: 1618304401,
      }),
    ];

    const block = new Block({
      transactions,
      timestamp: 1618304500,
      parentHash: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    });

    const serializedBlock = block.serialize();
    const deserializedBlock = Block.deserialize(serializedBlock);

    expect(deserializedBlock.transactions).toEqual(transactions);
    expect(deserializedBlock.timestamp).toEqual(1618304500);
    expect(deserializedBlock.parentHash).toEqual('0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef');
  });

  it('should calculate the correct block hash', () => {
    // TODO: Write tests for hash calculation
  });
});