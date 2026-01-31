import { Block } from '../src/blockchain/Block';

describe('Block', () => {
  it('should create a new block', () => {
    const block = new Block(
      1,
      Date.now(),
      [{ id: 'tx1', value: 10 }],
      'prev_hash',
      'block_hash'
    );
    expect(block.index).toEqual(1);
    expect(block.timestamp).toBeGreaterThan(0);
    expect(block.transactions).toEqual([{ id: 'tx1', value: 10 }]);
    expect(block.previousHash).toEqual('prev_hash');
    expect(block.hash).toEqual('block_hash');
  });

  it('should validate a block', () => {
    const block = new Block(
      1,
      Date.now(),
      [{ id: 'tx1', value: 10 }],
      'prev_hash',
      'block_hash'
    );
    expect(block.validate()).toBeTruthy();
  });

  it('should serialize a block', () => {
    const block = new Block(
      1,
      Date.now(),
      [{ id: 'tx1', value: 10 }],
      'prev_hash',
      'block_hash'
    );
    const serialized = block.serialize();
    expect(typeof serialized).toEqual('string');
    expect(JSON.parse(serialized)).toEqual(block);
  });

  it('should calculate the block hash', () => {
    const block = new Block(
      1,
      Date.now(),
      [{ id: 'tx1', value: 10 }],
      'prev_hash',
      'block_hash'
    );
    const hash = block.calculateHash();
    expect(typeof hash).toEqual('string');
    expect(hash).toEqual('placeholder_hash');
  });
});