import { expect } from 'chai';
import { Block, Transaction, generateRandomBase58, generateHash, hexToBase58 } from './block';
import { StateManager } from './StateManager';
import { performance } from 'perf_hooks';

describe('Block Stress Tests', () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  it('should handle a sustained high transaction load', () => {
    const numBlocks = 100;
    const transactionsPerBlock = 1000;
    let prevBlock: Block | undefined;

    for (let i = 0; i < numBlocks; i++) {
      const transactions: Transaction[] = [];
      for (let j = 0; j < transactionsPerBlock; j++) {
        transactions.push({
          hash: generateRandomBase58(),
          from: generateRandomBase58(),
          to: generateRandomBase58(),
          value: BigInt(1000),
          gasPrice: BigInt(10),
          gasLimit: BigInt(21000),
          nonce: j,
          signature: generateRandomBase58()
        });
      }

      const startTime = performance.now();
      const block = new Block(i + 1, prevBlock?.header.hash || generateRandomBase58(), generateRandomBase58(), transactions);
      expect(block.isValid(prevBlock, stateManager)).to.be.true;
      const endTime = performance.now();

      console.log(`Block ${i + 1} created in ${endTime - startTime}ms`);
      prevBlock = block;
      stateManager.applyBlock(block);
    }

    expect(stateManager.getLatestBlockNumber()).to.equal(numBlocks);
  });

  it('should handle transaction spikes', () => {
    const numBlocks = 100;
    let prevBlock: Block | undefined;

    for (let i = 0; i < numBlocks; i++) {
      const transactions: Transaction[] = [];
      const transactionsPerBlock = i % 2 === 0 ? 10 : 1000;

      for (let j = 0; j < transactionsPerBlock; j++) {
        transactions.push({
          hash: generateRandomBase58(),
          from: generateRandomBase58(),
          to: generateRandomBase58(),
          value: BigInt(1000),
          gasPrice: BigInt(10),
          gasLimit: BigInt(21000),
          nonce: j,
          signature: generateRandomBase58()
        });
      }

      const startTime = performance.now();
      const block = new Block(i + 1, prevBlock?.header.hash || generateRandomBase58(), generateRandomBase58(), transactions);
      expect(block.isValid(prevBlock, stateManager)).to.be.true;
      const endTime = performance.now();

      console.log(`Block ${i + 1} created in ${endTime - startTime}ms`);
      prevBlock = block;
      stateManager.applyBlock(block);
    }

    expect(stateManager.getLatestBlockNumber()).to.equal(numBlocks);
  });

  it('should handle network delays and node failures', () => {
    const numBlocks = 100;
    let prevBlock: Block | undefined;

    for (let i = 0; i < numBlocks; i++) {
      const transactions: Transaction[] = [];
      const transactionsPerBlock = 100;

      for (let j = 0; j < transactionsPerBlock; j++) {
        transactions.push({
          hash: generateRandomBase58(),
          from: generateRandomBase58(),
          to: generateRandomBase58(),
          value: BigInt(1000),
          gasPrice: BigInt(10),
          gasLimit: BigInt(21000),
          nonce: j,
          signature: generateRandomBase58()
        });
      }

      const startTime = performance.now();
      const block = new Block(i + 1, prevBlock?.header.hash || generateRandomBase58(), generateRandomBase58(), transactions);
      expect(block.isValid(prevBlock, stateManager)).to.be.true;
      const endTime = performance.now();

      console.log(`Block ${i + 1} created in ${endTime - startTime}ms`);
      prevBlock = block;
      stateManager.applyBlock(block);

      // Simulate network delay or node failure
      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    expect(stateManager.getLatestBlockNumber()).to.equal(numBlocks);
  });
});