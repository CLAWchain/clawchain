import { Block, generateRandomBase58, Transaction } from '../Block';
import { Chain } from '../Chain';
import { StateManager } from '../StateManager';
import { TransactionPool } from '../TransactionPool';

describe('Block Production Stress Tests', () => {
  let chain: Chain;
  let stateManager: StateManager;
  let transactionPool: TransactionPool;

  beforeEach(() => {
    stateManager = new StateManager();
    transactionPool = new TransactionPool();
    chain = new Chain(stateManager, transactionPool);
  });

  it('should produce blocks with thousands of transactions', () => {
    const numTransactions = 5000;
    const transactions: Transaction[] = [];

    for (let i = 0; i < numTransactions; i++) {
      const tx: Transaction = {
        hash: generateRandomBase58(),
        from: generateRandomBase58(20),
        to: generateRandomBase58(20),
        value: BigInt(Math.floor(Math.random() * 1000000)),
        gasPrice: BigInt(Math.floor(Math.random() * 100000)),
        gasLimit: BigInt(21000),
        nonce: i,
        signature: generateRandomBase58(64)
      };
      transactions.push(tx);
    }

    const startTime = Date.now();
    const block = new Block(1, '0x0', 'producer', transactions);
    const isValid = block.isValid();
    const duration = Date.now() - startTime;

    console.log(`Block with ${numTransactions} transactions created and validated in ${duration}ms`);
    expect(isValid).toBe(true);
  });

  it('should handle rapid block production', async () => {
    const numBlocks = 100;
    const transactionsPerBlock = 100;
    const startTime = Date.now();

    for (let i = 0; i < numBlocks; i++) {
      const transactions: Transaction[] = [];
      for (let j = 0; j < transactionsPerBlock; j++) {
        const tx: Transaction = {
          hash: generateRandomBase58(),
          from: generateRandomBase58(20),
          to: generateRandomBase58(20),
          value: BigInt(Math.floor(Math.random() * 1000000)),
          gasPrice: BigInt(Math.floor(Math.random() * 100000)),
          gasLimit: BigInt(21000),
          nonce: j,
          signature: generateRandomBase58(64)
        };
        transactions.push(tx);
      }

      const block = new Block(i + 1, chain.getLatestBlock().header.hash, 'producer', transactions);
      const isValid = block.isValid(chain.getLatestBlock());
      chain.addBlock(block);
      expect(isValid).toBe(true);
    }

    const duration = Date.now() - startTime;
    console.log(`${numBlocks} blocks with ${transactionsPerBlock} transactions each created and validated in ${duration}ms`);
  });
});