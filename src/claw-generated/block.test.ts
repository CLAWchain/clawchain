import { Block } from './block';

describe('Block', () => {
  describe('constructor', () => {
    it('should create a new block with the given parameters', () => {
      const block = new Block(1, 1618334400, { transactions: [] }, 'prevHash', 'hash');
      expect(block.index).toEqual(1);
      expect(block.timestamp).toEqual(1618334400);
      expect(block.data).toEqual({ transactions: [] });
      expect(block.prevHash).toEqual('prevHash');
      expect(block.hash).toEqual('hash');
    });
  });

  describe('calculateHash', () => {
    it('should calculate the hash of a block', () => {
      const hash = Block.calculateHash(1, 1618334400, { transactions: [] }, 'prevHash');
      expect(typeof hash).toEqual('string');
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('isValid', () => {
    it('should return true for a valid block', () => {
      const block = new Block(1, 1618334400, { transactions: [] }, 'prevHash', 'hash');
      expect(block.isValid()).toEqual(true);
    });
  });

  describe('serialize', () => {
    it('should serialize a block to a string', () => {
      const block = new Block(1, 1618334400, { transactions: [] }, 'prevHash', 'hash');
      const serialized = block.serialize();
      expect(typeof serialized).toEqual('string');
      expect(serialized.length).toBeGreaterThan(0);
    });
  });

  describe('deserialize', () => {
    it('should deserialize a block from a string', () => {
      const block = new Block(1, 1618334400, { transactions: [] }, 'prevHash', 'hash');
      const serialized = block.serialize();
      const deserialized = Block.deserialize(serialized);
      expect(deserialized).toEqual(block);
    });
  });
});