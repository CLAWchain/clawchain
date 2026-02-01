import { Block } from './block';
import { hash } from '../utils/crypto';

describe('Block', () => {
  describe('constructor', () => {
    it('should create a new block with the correct properties', () => {
      const timestamp = Date.now();
      const previousHash = 'abc123';
      const transactions = [
        { from: 'Alice', to: 'Bob', amount: 10 },
        { from: 'Bob', to: 'Charlie', amount: 5 }
      ];
      const nonce = 123456;

      const block = new Block(timestamp, previousHash, transactions, nonce);

      expect(block.timestamp).toEqual(timestamp);
      expect(block.previousHash).toEqual(previousHash);
      expect(block.transactions).toEqual(transactions);
      expect(block.nonce).toEqual(nonce);
    });
  });

  describe('serialize', () => {
    it('should serialize a block to a JSON string', () => {
      const timestamp = Date.now();
      const previousHash = 'abc123';
      const transactions = [
        { from: 'Alice', to: 'Bob', amount: 10 },
        { from: 'Bob', to: 'Charlie', amount: 5 }
      ];
      const nonce = 123456;

      const block = new Block(timestamp, previousHash, transactions, nonce);
      const serializedBlock = block.serialize();

      expect(typeof serializedBlock).toEqual('string');

      const deserializedBlock = Block.deserialize(serializedBlock);
      expect(deserializedBlock.timestamp).toEqual(block.timestamp);
      expect(deserializedBlock.previousHash).toEqual(block.previousHash);
      expect(deserializedBlock.transactions).toEqual(block.transactions);
      expect(deserializedBlock.nonce).toEqual(block.nonce);
    });
  });

  describe('getHash', () => {
    it('should calculate the correct block hash', () => {
      const timestamp = Date.now();
      const previousHash = 'abc123';
      const transactions = [
        { from: 'Alice', to: 'Bob', amount: 10 },
        { from: 'Bob', to: 'Charlie', amount: 5 }
      ];
      const nonce = 123456;

      const block = new Block(timestamp, previousHash, transactions, nonce);
      const expectedHash = hash(timestamp, previousHash, JSON.stringify(transactions), nonce);

      expect(block.getHash()).toEqual(expectedHash);
    });
  });

  describe('isValid', () => {
    it('should return true for a valid block', () => {
      const timestamp = Date.now();
      const previousHash = 'abc123';
      const transactions = [
        { from: 'Alice', to: 'Bob', amount: 10 },
        { from: 'Bob', to: 'Charlie', amount: 5 }
      ];
      const nonce = 123456;

      const block = new Block(timestamp, previousHash, transactions, nonce);

      expect(block.isValid()).toBe(true);
    });

    // TODO: Add more tests for invalid blocks
  });
});