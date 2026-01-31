import { Block } from './block';
import { Transaction } from '../transaction/transaction';

describe('Block', () => {
  test('can create a new block with valid transactions', () => {
    const tx1 = new Transaction({
      from: '0x1234567890abcdef',
      to: '0x0987654321fedcba',
      amount: 100,
      fee: 10,
      nonce: 1,
    });
    const tx2 = new Transaction({
      from: '0x0987654321fedcba',
      to: '0x1234567890abcdef',
      amount: 50,
      fee: 5,
      nonce: 2,
    });

    const block = new Block([tx1, tx2]);

    expect(block.transactions).toHaveLength(2);
    expect(block.transactions[0]).toEqual(tx1);
    expect(block.transactions[1]).toEqual(tx2);
    expect(block.reward).toBe(20);
  });

  test('can serialize and deserialize a block', () => {
    const tx1 = new Transaction({
      from: '0x1234567890abcdef',
      to: '0x0987654321fedcba',
      amount: 100,
      fee: 10,
      nonce: 1,
    });
    const tx2 = new Transaction({
      from: '0x0987654321fedcba',
      to: '0x1234567890abcdef',
      amount: 50,
      fee: 5,
      nonce: 2,
    });

    const block = new Block([tx1, tx2]);

    const serializedBlock = JSON.stringify(block);
    const deserializedBlock = JSON.parse(serializedBlock);

    expect(deserializedBlock.transactions).toHaveLength(2);
    expect(deserializedBlock.transactions[0]).toEqual(tx1);
    expect(deserializedBlock.transactions[1]).toEqual(tx2);
    expect(deserializedBlock.reward).toBe(20);
  });
});