import { Chain } from './Chain';
import { Block, Transaction } from './Block';
import { TransactionPool } from './TransactionPool';
import { ValidatorManager } from '../validators/ValidatorManager';
import { EventBus } from '../events/EventBus';
import { BlockProducer } from './BlockProducer';
import { stateManager } from './StateManager';
import { generateRandomBase58 } from './Block';

const MAX_TRANSACTIONS = 1000;
const NUM_TESTS = 10;

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

  test('Produce blocks under high transaction load', async () => {
    blockProducer.start();

    for (let i = 0; i < NUM_TESTS; i++) {
      console.log(`\n===== Test ${i + 1}/${NUM_TESTS} =====`);

      // Generate a large number of transactions
      const transactions: Transaction[] = [];
      for (let j = 0; j < MAX_TRANSACTIONS; j++) {
        const tx: Transaction = {
          hash: generateRandomBase58(64),
          from: generateRandomBase58(44),
          to: generateRandomBase58(44),
          value: BigInt(Math.floor(Math.random() * 1000000000)),
          gasPrice: 1000000n,
          gasLimit: 21000n,
          nonce: j,
          signature: generateRandomBase58(64)
        };
        transactions.push(tx);
      }

      // Submit transactions to the pool
      console.log(`Submitting ${transactions.length} transactions to the pool...`);
      await txPool.addTransactions(transactions);

      // Wait for the block producer to process the transactions
      await new Promise((resolve) => setTimeout(resolve, 15000));

      // Verify the block production
      const latestBlock = chain.getLatestBlock();
      expect(latestBlock).not.toBeUndefined();
      expect(latestBlock?.transactions.length).toBeGreaterThan(0);
      expect(latestBlock?.header.gasUsed).toBeGreaterThan(0n);

      // Clear the transaction pool for the next test
      await txPool.clearPool();
    }
  }, 60000);
});