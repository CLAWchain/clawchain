import { Block } from './block';
import { Transaction, TransactionManager } from '../transaction/transaction';
import { Account } from '../account/account';
import { Chain } from '../chain/chain';

class BlockStressTests {
  static async runBlockProductionStressTest(
    numTransactions: number,
    transactionsPerSecond: number
  ): Promise<void> {
    console.log(`Running block production stress test with ${numTransactions} transactions at ${transactionsPerSecond} TPS...`);

    // Create test accounts
    const account1 = new Account();
    const account2 = new Account();

    // Generate transactions
    const transactions: Transaction[] = [];
    for (let i = 0; i < numTransactions; i++) {
      const tx = TransactionManager.createTransaction(account1, account2, 1, i);
      const signedTx = TransactionManager.signTransaction(tx, account1.privateKey);
      transactions.push(signedTx);
    }

    // Simulate transaction submission over time
    for (let i = 0; i < numTransactions; i++) {
      const tx = transactions[i];
      // Submit transaction to the network
      await Chain.instance.processTransaction(tx);

      // Simulate delay between transactions
      await new Promise((resolve) => setTimeout(resolve, 1000 / transactionsPerSecond));
    }

    // Wait for blocks to be produced
    const startTime = Date.now();
    let blockCount = 0;
    while (Date.now() - startTime < 60000) { // Wait for 1 minute
      const blocks = await Chain.instance.getBlocks();
      blockCount += blocks.length;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Verify block production rate and other metrics
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const actualTPS = blockCount * Chain.instance.transactionsPerBlock / elapsedSeconds;
    console.log(`Actual TPS: ${actualTPS.toFixed(2)}`);
    console.log(`Blocks produced: ${blockCount}`);

    console.log('Block production stress test completed successfully!');
  }

  static async runMultipleBlockProductionStressTests(
    numTests: number,
    numTransactions: number,
    transactionsPerSecond: number
  ): Promise<void> {
    for (let i = 0; i < numTests; i++) {
      console.log(`Running block production stress test ${i + 1} of ${numTests}`);
      await this.runBlockProductionStressTest(numTransactions, transactionsPerSecond);
    }
  }

  static async runBlockPropagationStressTest(
    numBlocks: number,
    blockInterval: number
  ): Promise<void> {
    console.log(`Running block propagation stress test with ${numBlocks} blocks at ${blockInterval} second intervals...`);

    // Create a chain of blocks
    const blocks: Block[] = [];
    for (let i = 0; i < numBlocks; i++) {
      const block = await Block.create(i, [], Date.now() + i * blockInterval * 1000);
      blocks.push(block);
    }

    // Propagate the blocks through the network
    const startTime = Date.now();
    for (const block of blocks) {
      await Chain.instance.processBlock(block);
      await new Promise((resolve) => setTimeout(resolve, blockInterval * 1000));
    }

    // Measure block propagation time
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const actualBlocksPerSecond = numBlocks / elapsedSeconds;
    console.log(`Actual blocks per second: ${actualBlocksPerSecond.toFixed(2)}`);

    console.log('Block propagation stress test completed successfully!');
  }
}

export { BlockStressTests };