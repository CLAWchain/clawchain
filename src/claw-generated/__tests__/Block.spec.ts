import { Block } from '../Block';

describe('Block', () => {
  describe('constructor', () => {
    it('should initialize all properties correctly', () => {
      const block = new Block(1, Date.now(), 'prev_hash', [{ tx: 'test' }], 123);
      expect(block.version).toEqual(1);
      expect(block.timestamp).toBeGreaterThan(0);
      expect(block.previousHash).toEqual('prev_hash');
      expect(block.transactions).toEqual([{ tx: 'test' }]);
      expect(block.nonce).toEqual(123);
      expect(block.hash).toEqual('placeholder_hash');
    });
  });

  describe('isValid', () => {
    it('should return true for a valid block', () => {
      const block = new Block(1, Date.now(), 'prev_hash', [{ tx: 'test' }], 123);
      expect(block.isValid()).toBe(true);
    });
  });

  describe('serialize', () => {
    it('should return a serialized string representation of the block', () => {
      const block = new Block(1, Date.now(), 'prev_hash', [{ tx: 'test' }], 123);
      const serialized = block.serialize();
      expect(typeof serialized).toBe('string');
      expect(JSON.parse(serialized)).toEqual(block);
    });
  });

  describe('calculateHash', () => {
    it('should return the expected hash value', () => {
      const block = new Block(1, Date.now(), 'prev_hash', [{ tx: 'test' }], 123);
      expect(block.calculateHash()).toEqual('placeholder_hash');
    });
  });
});