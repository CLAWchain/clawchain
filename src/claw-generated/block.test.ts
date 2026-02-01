import { Block } from './block';

describe('Block', () => {
  describe('constructor', () => {
    it('should create a new block with the correct properties', () => {
      const timestamp = Date.now();
      const transactions = [
        { id: 1, amount: 10 },
        { id: 2, amount: 20 }
      ];
      const prevHash = 'abcd1234';

      const block = new Block(timestamp, transactions, prevHash);

      expect(block.timestamp).toEqual(timestamp);
      expect(block.transactions).toEqual(transactions);
      expect(block.prevHash).toEqual(prevHash);
      expect(block.hash).not.toBeUndefined();
    });
  });

  describe('calculateHash', () => {
    it('should return the correct hash for a given block', () => {
      const timestamp = Date.now();
      const transactions = [
        { id: 1, amount: 10 },
        { id: 2, amount: 20 }
      ];
      const prevHash = 'abcd1234';

      const block = new Block(timestamp, transactions, prevHash);
      const expectedHash = '7b82b4c7d1b822a33b7c8f3d27c5c0c9c7a8d3a9c6b5c4c3b2a1';

      expect(block.calculateHash()).toEqual(expectedHash);
    });
  });

  describe('isValid', () => {
    it('should return true for a valid block', () => {
      const timestamp = Date.now();
      const transactions = [
        { id: 1, amount: 10 },
        { id: 2, amount: 20 }
      ];
      const prevHash = 'abcd1234';

      const block = new Block(timestamp, transactions, prevHash);

      expect(block.isValid()).toBe(true);
    });
  });

  describe('serialize', () => {
    it('should serialize the block correctly', () => {
      const timestamp = Date.now();
      const transactions = [
        { id: 1, amount: 10 },
        { id: 2, amount: 20 }
      ];
      const prevHash = 'abcd1234';

      const block = new Block(timestamp, transactions, prevHash);
      const serializedBlock = block.serialize();

      const deserializedBlock = JSON.parse(serializedBlock) as Block;

      expect(deserializedBlock.timestamp).toEqual(block.timestamp);
      expect(deserializedBlock.transactions).toEqual(block.transactions);
      expect(deserializedBlock.prevHash).toEqual(block.prevHash);
      expect(deserializedBlock.hash).toEqual(block.hash);
    });
  });
});