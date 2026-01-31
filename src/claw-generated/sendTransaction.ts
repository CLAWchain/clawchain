import { Transaction } from '../transaction';
import { TransactionPool } from '../transactionPool';
import { TxSignature } from '../types';

export async function sendTransaction(rawTx: string): Promise<{ txId: string }> {
  // 1. Decode the base64-encoded transaction
  const tx = Transaction.fromBase64(rawTx);

  // 2. Verify the transaction signature
  if (!tx.verifySignature()) {
    throw new Error('Invalid transaction signature');
  }

  // 3. Add the transaction to the pool
  await TransactionPool.addTransaction(tx);

  // 4. Return the transaction ID
  return { txId: tx.hash() };
}