import { Chain } from './Chain';
import { TransactionPool } from './TransactionPool';
import { Crypto } from './Crypto';
import { stateManager } from './StateManager';

const NUM_TRANSACTIONS = 10000;
const CONCURRENT_SENDERS = 10;

async function generateStressTransactions() {
  const chain = new Chain();
  const txPool = new TransactionPool();
  await txPool.initialize();

  // Generate transactions
  console.log(`Generating ${NUM_TRANSACTIONS} transactions...`);
  const transactions: any[] = [];
  for (let i = 0; i < NUM_TRANSACTIONS; i++) {
    const from = Crypto.generateAddress();
    const to = Crypto.generateAddress();
    const value = BigInt(Math.floor(Math.random() * 1000000000));
    const gasPrice = BigInt(Math.floor(Math.random() * 100) + 1);
    const gasLimit = BigInt(Math.floor(Math.random() * 100000) + 21000);
    const nonce = await stateManager.getNonce(from);
    const tx = {
      hash: Crypto.sha256Base58(JSON.stringify({ from, to, value, gasPrice, gasLimit, nonce })),
      from,
      to,
      value,
      gasPrice,
      gasLimit,
      nonce,
      data: null,
      signature: Crypto.signTransaction({ from, to, value, gasPrice, gasLimit, nonce }, from)
    };
    transactions.push(tx);
  }

  // Send transactions concurrently
  console.log(`Sending ${CONCURRENT_SENDERS} concurrent batches of ${Math.floor(NUM_TRANSACTIONS / CONCURRENT_SENDERS)} transactions...`);
  const promises = [];
  for (let i = 0; i < CONCURRENT_SENDERS; i++) {
    const batch = transactions.slice(i * Math.floor(NUM_TRANSACTIONS / CONCURRENT_SENDERS), (i + 1) * Math.floor(NUM_TRANSACTIONS / CONCURRENT_SENDERS));
    promises.push(sendTransactionBatch(txPool, batch));
  }
  await Promise.all(promises);

  console.log('Stress test complete.');
}

async function sendTransactionBatch(txPool: TransactionPool, transactions: any[]) {
  for (const tx of transactions) {
    await txPool.addTransaction(tx);
  }
}

generateStressTransactions();