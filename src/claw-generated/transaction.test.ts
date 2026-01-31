import { Transaction } from './transaction';
import { TransactionInput, TransactionOutput } from './transaction-io';
import { Block } from './block';

describe('Transaction', () => {
  test('calculateSize', () => {
    const inputs: TransactionInput[] = [
      { size: 100, value: 10 },
      { size: 50, value: 5 }
    ];
    const outputs: TransactionOutput[] = [
      { size: 75, value: 7 },
      { size: 25, value: 3 }
    ];
    const transaction = new Transaction(inputs, outputs, 0, 0);
    expect(transaction.calculateSize()).toEqual(100 + 50 + 75 + 25 + 8);
  });

  test('calculateComplexity', () => {
    const inputs: TransactionInput[] = [
      { size: 100, value: 10 },
      { size: 50, value: 5 },
      { size: 75, value: 7 }
    ];
    const outputs: TransactionOutput[] = [
      { size: 25, value: 3 },
      { size: 30, value: 4 }
    ];
    const transaction = new Transaction(inputs, outputs, 0, 0);
    expect(transaction.calculateComplexity()).toEqual(3 + 2);
  });

  test('calculateFee', () => {
    const inputs: TransactionInput[] = [
      { size: 100, value: 10 },
      { size: 50, value: 5 },
      { size: 75, value: 7 }
    ];
    const outputs: TransactionOutput[] = [
      { size: 25, value: 3 },
      { size: 30, value: 4 }
    ];
    const transaction = new Transaction(inputs, outputs, 0, 0);
    const fee = transaction.calculateFee();
    expect(fee).toBeGreaterThan(0);
  });

  test('addToBlock', () => {
    const inputs: TransactionInput[] = [
      { size: 100, value: 10 },
      { size: 50, value: 5 },
      { size: 75, value: 7 }
    ];
    const outputs: TransactionOutput[] = [
      { size: 25, value: 3 },
      { size: 30, value: 4 }
    ];
    const transaction = new Transaction(inputs, outputs, 0.01, 0);
    const block = new Block(null);
    transaction.addToBlock(block);
    expect(block.transactions.length).toEqual(1);
    expect(block.totalFees).toEqual(0.01);
  });
});