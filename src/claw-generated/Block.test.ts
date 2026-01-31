import { Block } from './Block';
import { Transaction } from './Transaction';
import { MerkleTree } from './MerkleTree';

describe('Block', () => {
  let transactions: Transaction[];
  let previousHash: string;

  beforeEach(() => {
    transactions = [
      new Transaction(
        'sender1',
        'recipient1',
        100,
        1234567890
      ),
      new Transaction(
        'sender2',
        'recipient2',
        50,
        1234567891
      )
    ];
    previousHash = '0123456789abcdef';
  });

  it('should create a new block with correct properties', () => {
    const block = new Block(1, 1234567890, transactions, previousHash);
    expect(block.version).toEqual(1);
    expect(block.timestamp).toEqual(1234567890);
    expect(block.transactions).toEqual(transactions);
    expect(block.previousHash).toEqual(previousHash);
    expect(block.merkleRoot).not.toBeEmpty();
    expect(block.nonce).toEqual(0);
    expect(block.hash).not.toBeEmpty();
  });

  it('should calculate the correct merkle root', () => {
    const block = new Block(1, 1234567890, transactions, previousHash);
    const merkleTree = new MerkleTree(transactions);
    expect(block.merkleRoot).toEqual(merkleTree.getRoot());
  });

  it('should validate a correct block', () => {
    const block = new Block(1, 1234567890, transactions, previousHash);
    expect(block.validate()).toBeTrue();
  });

  it('should serialize and deserialize a block correctly', () => {
    const block = new Block(1, 1234567890, transactions, previousHash);
    const serializedBlock = block.serialize();
    const deserializedBlock = JSON.parse(serializedBlock);
    expect(deserializedBlock.version).toEqual(block.version);
    expect(deserializedBlock.timestamp).toEqual(block.timestamp);
    expect(deserializedBlock.transactions).toEqual(block.transactions);
    expect(deserializedBlock.previousHash).toEqual(block.previousHash);
    expect(deserializedBlock.merkleRoot).toEqual(block.merkleRoot);
    expect(deserializedBlock.nonce).toEqual(block.nonce);
    expect(deserializedBlock.hash).toEqual(block.hash);
  });
});