import { Block } from './block';
import { Transaction } from './transaction';

describe('Block', () => {
  it('should create a new block', () => {
    const timestamp = Date.now();
    const transactions: Transaction[] = [
      new Transaction(
        'sender',
        'recipient',
        100,
        'signature'
      )
    ];
    const parentHash = 'previous-block-hash';

    const block = new Block(timestamp, transactions, parentHash);

    expect(block.timestamp).toEqual(timestamp);
    expect(block.transactions).toEqual(transactions);
    expect(block.parentHash).toEqual(parentHash);
    expect(block.hash).not.toBeEmpty();
  });

  it('should validate a block', () => {
    const timestamp = Date.now();
    const transactions: Transaction[] = [
      new Transaction(
        'sender',
        'recipient',
        100,
        'signature'
      )
    ];
    const parentHash = 'previous-block-hash';

    const block = new Block(timestamp, transactions, parentHash);

    expect(block.validate()).toBeTrue();
  });

  it('should serialize and deserialize a block', () => {
    const timestamp = Date.now();
    const transactions: Transaction[] = [
      new Transaction(
        'sender',
        'recipient',
        100,
        'signature'
      )
    ];
    const parentHash = 'previous-block-hash';

    const block = new Block(timestamp, transactions, parentHash);
    const serializedBlock = block.serialize();

    // Deserialize the block and verify the contents
    const deserializedBlock = JSON.parse(serializedBlock);
    expect(deserializedBlock.timestamp).toEqual(timestamp);
    expect(deserializedBlock.transactions).toEqual(transactions);
    expect(deserializedBlock.parentHash).toEqual(parentHash);
    expect(deserializedBlock.hash).toEqual(block.hash);
  });

  it('should calculate the correct hash', () => {
    const timestamp = Date.now();
    const transactions: Transaction[] = [
      new Transaction(
        'sender',
        'recipient',
        100,
        'signature'
      )
    ];
    const parentHash = 'previous-block-hash';

    const block = new Block(timestamp, transactions, parentHash);
    const expectedHash = block.calculateHash();

    expect(block.hash).toEqual(expectedHash);
  });
});