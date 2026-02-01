import { Block } from '../Block';

describe('Block', () => {
  describe('constructor', () => {
    it('should initialize all properties correctly', () => {
      const block = new Block(1, 'prev_hash', 'producer', [{ tx: 'test' }], 123);
      expect(block.header.height).toEqual(1);
      expect(block.header.parentHash).toEqual('prev_hash');
      expect(block.header.producer).toEqual('producer');
      expect(block.transactions).toEqual([{ tx: 'test' }]);
      expect(block.header.nonce).toEqual(123);
      expect(block.header.hash).not.toEqual('');
    });
  });

  describe('isValid', () => {
    it('should return true for a valid block', () => {
      const block = new Block(1, 'prev_hash', 'producer', [{ tx: 'test' }], 123);
      expect(block.isValid()).toBe(true);
    });
  });

  describe('serialize', () => {
    it('should return a serialized string representation of the block', () => {
      const block = new Block(1, 'prev_hash', 'producer', [{ tx: 'test' }], 123);
      const serialized = block.toJSON();
      expect(typeof serialized).toBe('object');
      expect(serialized.height).toEqual(1);
      expect(serialized.parentHash).toEqual('prev_hash');
      expect(serialized.producer).toEqual('producer');
      expect(serialized.transactions).toEqual([{ tx: 'test' }]);
      expect(serialized.nonce).toEqual(123);
      expect(serialized.hash).not.toEqual('');
    });
  });

  describe('calculateHash', () => {
    it('should return the expected hash value', () => {
      const block = new Block(1, 'prev_hash', 'producer', [{ tx: 'test' }], 123);
      expect(block.header.hash).not.toEqual('');
    });
  });
});