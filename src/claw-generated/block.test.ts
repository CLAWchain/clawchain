import { Block } from './block';

describe('Block', () => {
  describe('creation', () => {
    it('should create a new block with the correct properties', () => {
      const block = new Block({
        index: 1,
        timestamp: 1234567890,
        transactions: [
          { id: '0x123', from: '0xabc', to: '0xdef', amount: 10 },
          { id: '0x456', from: '0xghi', to: '0xjkl', amount: 5 }
        ],
        previousHash: '0xabcd1234',
        nonce: 42
      });

      expect(block.index).toEqual(1);
      expect(block.timestamp).toEqual(1234567890);
      expect(block.transactions).toEqual([
        { id: '0x123', from: '0xabc', to: '0xdef', amount: 10 },
        { id: '0x456', from: '0xghi', to: '0xjkl', amount: 5 }
      ]);
      expect(block.previousHash).toEqual('0xabcd1234');
      expect(block.nonce).toEqual(42);
    });
  });

  describe('validation', () => {
    it('should validate a correctly formed block', () => {
      const block = new Block({
        index: 1,
        timestamp: 1234567890,
        transactions: [
          { id: '0x123', from: '0xabc', to: '0xdef', amount: 10 },
          { id: '0x456', from: '0xghi', to: '0xjkl', amount: 5 }
        ],
        previousHash: '0xabcd1234',
        nonce: 42
      });

      expect(block.isValid()).toEqual(true);
    });

    it('should not validate a block with invalid transactions', () => {
      const block = new Block({
        index: 1,
        timestamp: 1234567890,
        transactions: [
          { id: '0x123', from: '0xabc', to: '0xdef', amount: -5 },
          { id: '0x456', from: '0xghi', to: '0xjkl', amount: 5 }
        ],
        previousHash: '0xabcd1234',
        nonce: 42
      });

      expect(block.isValid()).toEqual(false);
    });
  });

  describe('serialization', () => {
    it('should serialize and deserialize a block correctly', () => {
      const block = new Block({
        index: 1,
        timestamp: 1234567890,
        transactions: [
          { id: '0x123', from: '0xabc', to: '0xdef', amount: 10 },
          { id: '0x456', from: '0xghi', to: '0xjkl', amount: 5 }
        ],
        previousHash: '0xabcd1234',
        nonce: 42
      });

      const serializedBlock = block.serialize();
      const deserializedBlock = Block.deserialize(serializedBlock);

      expect(deserializedBlock.index).toEqual(block.index);
      expect(deserializedBlock.timestamp).toEqual(block.timestamp);
      expect(deserializedBlock.transactions).toEqual(block.transactions);
      expect(deserializedBlock.previousHash).toEqual(block.previousHash);
      expect(deserializedBlock.nonce).toEqual(block.nonce);
    });
  });

  describe('hashing', () => {
    it('should calculate the correct hash for a block', () => {
      const block = new Block({
        index: 1,
        timestamp: 1234567890,
        transactions: [
          { id: '0x123', from: '0xabc', to: '0xdef', amount: 10 },
          { id: '0x456', from: '0xghi', to: '0xjkl', amount: 5 }
        ],
        previousHash: '0xabcd1234',
        nonce: 42
      });

      const expectedHash = '0x5c1b4f4d4d0d2e5b3d7d3e4d5d0d2e5b3d7d3e4d5d0d2e5b3d7d3e4d5d0d2e5';
      expect(block.hash()).toEqual(expectedHash);
    });
  });
});