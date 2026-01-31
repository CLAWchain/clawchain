import { Chain } from './Chain';
import { Block } from './Block';
import { Transaction } from './Transaction';
import { TransactionPool } from './TransactionPool';
import { ValidatorManager } from '../validators/ValidatorManager';
import { EventBus } from '../events/EventBus';
import { BlockProducer } from './BlockProducer';
import { stateManager } from './StateManager';

const MAX_TRANSACTIONS_PER_BLOCK = 500;
const BLOCK_PRODUCTION_INTERVAL = 10000; // 10 seconds

describe('Block Production Stress Tests', () => {
  let chain: Chain;
  let txPool: TransactionPool;
  let validatorManager: ValidatorManager;
  let eventBus: EventBus;
  let blockProducer: BlockProducer;

  beforeAll(() => {
    chain = new Chain();
    txPool = new TransactionPool();
    validatorManager = new ValidatorManager();
    eventBus = new EventBus();
    blockProducer = new BlockProducer(chain, txPool, validatorManager, eventBus);
  });

  afterAll(() => {
    blockProducer.stop();
  });

  test('Block production under high transaction load', async () => {
    // Start block production
    blockProducer.start();

    // Generate a large number of transactions
    const numTransactions = 10000;
    const transactions: Transaction[] = [];
    for (let i = 0; i < numTransactions; i++) {
      const tx = await stateManager.createTransaction(
        `0x${i.toString(16).padStart(40, '0')}`,
        `0x${(i + 1).toString(16).padStart(40, '0')}`,
        1n * 10n**18n,
        0n,
        21000n
      );
      transactions.push(tx);
    }

    // Submit transactions to the pool
    for (const tx of transactions) {
      await txPool.addTransaction(tx);
    }

    // Wait for blocks to be produced
    const startTime = Date.now();
    const targetBlocks = 10;
    let blocksProduced = 0;

    while (blocksProduced < targetBlocks) {
      const { isProducing, consecutiveFailures, currentDifficulty } = blockProducer.getStats();
      console.log(`Blocks produced: ${blocksProduced}/${targetBlocks}, Consecutive failures: ${consecutiveFailures}, Difficulty: ${currentDifficulty}`);

      await new Promise((resolve) => setTimeout(resolve, BLOCK_PRODUCTION_INTERVAL));
      blocksProduced = chain.getChainLength();
    }

    const duration = Date.now() - startTime;
    console.log(`Produced ${blocksProduced} blocks in ${duration}ms`);

    // Assertions
    expect(blocksProduced).toEqual(targetBlocks);
    expect(blockProducer.getStats().consecutiveFailures).toBeLessThan(3);
    expect(chain.getChainLength()).toBeGreaterThanOrEqual(targetBlocks);
    expect(txPool.getPendingTransactions(MAX_TRANSACTIONS_PER_BLOCK).length).toBeLessThan(MAX_TRANSACTIONS_PER_BLOCK);
  }, 120000);
});