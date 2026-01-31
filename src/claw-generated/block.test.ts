import { Block } from './block';
import { Transaction } from './transaction';
import { MerkleTree } from './merkle-tree';

describe('Block', () => {
  describe('constructor', () => {
    it('should create a new block with the correct properties', () => {
      const version = 1;
      const timestamp = Date.now();
      const previousHash = 'prevHash';
      const transactions: Transaction[] = [
        new Transaction('sender', 'recipient', 100),
      ];
      const nonce = 0;

      const block = new Block(version, timestamp, previousHash, transactions, nonce);

      expect(block.version).toBe(version);
      expect(block.timestamp).toBe(timestamp);
      expect(block.previousHash).toBe(previousHash);
      expect(block.transactions).toEqual(transactions);
      expect(block.merkleRoot).not.toBeEmpty();
      expect(block.nonce).toBe(nonce);
      expect(block.hash).not.toBeEmpty();
    });
  });

  describe('calculateMerkleRoot', () => {
    it('should calculate the correct Merkle root', () => {
      const transactions: Transaction[] = [
        new Transaction('sender1', 'recipient1', 100),
        new Transaction('sender2', 'recipient2', 200),
        new Transaction('sender3', 'recipient3', 300),
      ];

      const block = new Block(1, Date.now(), 'prevHash', transactions, 0);
      const merkleRoot = block.calculateMerkleRoot();

      expect(merkleRoot).not.toBeEmpty();
      // Add more assertions to verify the Merkle root calculation
    });
  });

  describe('calculateHash', () => {
    it('should calculate the correct hash', () => {
      const version = 1;
      const timestamp = Date.now();
      const previousHash = 'prevHash';
      const transactions: Transaction[] = [
        new Transaction('sender', 'recipient', 100),
      ];
      const nonce = 0;

      const block = new Block(version, timestamp, previousHash, transactions, nonce);
      const hash = block.calculateHash();

      expect(hash).not.toBeEmpty();
      expect(hash.length).toBe(64);
      // Add more assertions to verify the hash calculation
    });
  });

  describe('validate', () => {
    it('should validate a correct block', () => {
      const version = 1;
      const timestamp = Date.now();
      const previousHash = 'prevHash';
      const transactions: Transaction[] = [
        new Transaction('sender', 'recipient', 100),
      ];
      const nonce = 0;

      const block = new Block(version, timestamp, previousHash, transactions, nonce);
      const isValid = block.validate();

      expect(isValid).toBe(true);
    });

    it('should not validate a block with an invalid hash', () => {
      const version = 1;
      const timestamp = Date.now();
      const previousHash = 'prevHash';
      const transactions: Transaction[] = [
        new Transaction('sender', 'recipient', 100),
      ];
      const nonce = 0;

      const block = new Block(version, timestamp, previousHash, transactions, nonce);
      block.hash = 'invalidHash';
      const isValid = block.validate();

      expect(isValid).toBe(false);
    });
  });

  describe('serialize', () => {
    it('should serialize a block correctly', () => {
      const version = 1;
      const timestamp = Date.now();
      const previousHash = 'prevHash';
      const transactions: Transaction[] = [
        new Transaction('sender', 'recipient', 100),
      ];
      const nonce = 0;

      const block = new Block(version, timestamp, previousHash, transactions, nonce);
      const serializedBlock = block.serialize();

      expect(serializedBlock).not.toBeEmpty();
      // Add more assertions to verify the serialization
    });
  });
});