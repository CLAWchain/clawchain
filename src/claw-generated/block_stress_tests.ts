import { expect } from 'chai';
import { Block, Transaction, generateRandomBase58, generateHash, hexToBase58 } from './block';

describe('Block Stress Tests', () => {
  it('should handle a large number of transactions in a single block', () => {
    const transactions: Transaction[] = [];
    const numTransactions = 10000;

    for (let i = 0; i < numTransactions; i++) {
      transactions.push({
        hash: generateRandomBase58(),
        from: generateRandomBase58(),
        to: generateRandomBase58(),
        value: BigInt(1000),
        gasPrice: BigInt(10),
        gasLimit: BigInt(21000),
        nonce: i,
        signature: generateRandomBase58()
      });
    }

    const block = new Block(1, generateRandomBase58(), generateRandomBase58(), transactions);
    expect(block.transactions.length).to.equal(numTransactions);
    expect(block.isValid()).to.be.true;
  });

  it('should handle rapid, back-to-back block production', () => {
    const transactions: Transaction[] = [
      {
        hash: generateRandomBase58(),
        from: generateRandomBase58(),
        to: generateRandomBase58(),
        value: BigInt(1000),
        gasPrice: BigInt(10),
        gasLimit: BigInt(21000),
        nonce: 0,
        signature: generateRandomBase58()
      }
    ];

    let prevBlock: Block | undefined;
    const numBlocks = 1000;

    for (let i = 0; i < numBlocks; i++) {
      const block = new Block(i + 1, prevBlock?.header.hash || generateRandomBase58(), generateRandomBase58(), transactions);
      expect(block.isValid(prevBlock)).to.be.true;
      prevBlock = block;
    }
  });

  it('should handle fluctuating transaction rates', () => {
    const transactions: Transaction[] = [];
    const numBlocks = 100;
    const maxTransactionsPerBlock = 100;

    for (let i = 0; i < numBlocks; i++) {
      const numTransactions = Math.floor(Math.random() * maxTransactionsPerBlock);
      const blockTransactions: Transaction[] = [];

      for (let j = 0; j < numTransactions; j++) {
        blockTransactions.push({
          hash: generateRandomBase58(),
          from: generateRandomBase58(),
          to: generateRandomBase58(),
          value: BigInt(1000),
          gasPrice: BigInt(10),
          gasLimit: BigInt(21000),
          nonce: transactions.length,
          signature: generateRandomBase58()
        });
      }

      const block = new Block(i + 1, transactions.length > 0 ? transactions[transactions.length - 1].header.hash : generateRandomBase58(), generateRandomBase58(), blockTransactions);
      expect(block.isValid(transactions.length > 0 ? transactions[transactions.length - 1] : undefined)).to.be.true;
      transactions.push(block);
    }

    expect(transactions.length).to.equal(numBlocks);
  });
});