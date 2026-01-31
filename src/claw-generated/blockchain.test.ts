import { Blockchain, Block, Transaction } from './blockchain';

describe('Blockchain', () => {
  test('should not add block if it exceeds maximum size', () => {
    const blockchain = new Blockchain();
    const largeTransaction = new Transaction(
      'from',
      'to',
      1000000,
      'signature'
    );
    const block = new Block(
      0,
      Date.now(),
      [largeTransaction],
      '',
      '',
      0
    );

    expect(() => blockchain.mineBlock()).toThrowError('Block size exceeds maximum limit');
  });

  test('should add block if it is within maximum size', () => {
    const blockchain = new Blockchain();
    const transaction = new Transaction(
      'from',
      'to',
      100,
      'signature'
    );
    const block = new Block(
      0,
      Date.now(),
      [transaction],
      '',
      '',
      0
    );

    expect(() => blockchain.mineBlock()).not.toThrowError();
    expect(blockchain.chain.length).toBe(1);
  });

  test('should increase maximum block size if current block is larger than target', () => {
    const blockchain = new Blockchain();
    const largeTransaction = new Transaction(
      'from',
      'to',
      800000,
      'signature'
    );
    const block = new Block(
      0,
      Date.now(),
      [largeTransaction],
      '',
      '',
      0
    );

    blockchain.mineBlock();
    expect(blockchain.chain.length).toBe(1);
    expect(blockchain['MAX_BLOCK_SIZE']).toBeGreaterThan(1000000);
  });

  test('should decrease maximum block size if current block is smaller than target', () => {
    const blockchain = new Blockchain();
    const smallTransaction = new Transaction(
      'from',
      'to',
      100,
      'signature'
    );
    const block = new Block(
      0,
      Date.now(),
      [smallTransaction],
      '',
      '',
      0
    );

    blockchain.mineBlock();
    expect(blockchain.chain.length).toBe(1);
    expect(blockchain['MAX_BLOCK_SIZE']).toBeLessThan(1000000);
  });
});