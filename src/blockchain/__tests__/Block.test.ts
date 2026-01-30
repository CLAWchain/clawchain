import { Block } from '../Block';

describe('Block', () => {
  describe('creation', () => {
    it('should create a new block with the expected properties', () => {
      const block = new Block(
        1,
        'prevHash',
        1648777200,
        [{ id: 'tx1' }],
        42,
        'blockHash'
      );

      expect(block.version).toEqual(1);
      expect(block.previousHash).toEqual('prevHash');
      expect(block.timestamp).toEqual(1648777200);
      expect(block.transactions).toEqual([{ id: 'tx1' }]);
      expect(block.nonce).toEqual(42);
      expect(block.hash).toEqual('blockHash');
    });
  });

  describe('validation', () => {
    it('should return true for a valid block', () => {
      const block = new Block(
        1,
        'prevHash',
        1648777200,
        [{ id: 'tx1' }],
        42,
        'blockHash'
      );

      expect(block.validate()).toBe(true);
    });

    it('should return false for an invalid block', () => {
      const block = new Block(
        1,
        'prevHash',
        Date.now() / 1000 + 601,
        [{ id: 'tx1' }],
        42,
        'blockHash'
      );

      expect(block.validate()).toBe(false);
    });
  });

  describe('serialization', () => {
    it('should serialize the block to a string', () => {
      const block = new Block(
        1,
        'prevHash',
        1648777200,
        [{ id: 'tx1' }],
        42,
        'blockHash'
      );

      const serialized = block.serialize();
      expect(typeof serialized).toBe('string');

      const deserialized = block.deserialize(serialized);
      expect(deserialized.version).toEqual(block.version);
      expect(deserialized.previousHash).toEqual(block.previousHash);
      expect(deserialized.timestamp).toEqual(block.timestamp);
      expect(deserialized.transactions).toEqual(block.transactions);
      expect(deserialized.nonce).toEqual(block.nonce);
      expect(deserialized.hash).toEqual(block.hash);
    });
  });

  describe('hash calculation', () => {
    it('should calculate the correct block hash', () => {
      const block = new Block(
        1,
        'prevHash',
        1648777200,
        [{ id: 'tx1' }],
        42,
        'blockHash'
      );

      const calculatedHash = block.calculateHash();
      expect(calculatedHash).toEqual('blockHash');
    });
  });
});