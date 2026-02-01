import { TransactionPool } from '../TransactionPool';
import { Transaction } from '../transaction';

export async function getTransaction(signature: string): Promise&lt;Transaction | null&gt; {
  const transactionPool = new TransactionPool();
  const transaction = await transactionPool.getTransaction(signature);
  return transaction || null;
}