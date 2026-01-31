import { Transaction, TransactionReceipt } from '../transaction';
import { getTransaction as getTransactionFromDB } from '../getTransaction';

export async function getTransaction(signature: string): Promise<Transaction | null> {
  const transaction = await getTransactionFromDB(signature);
  return transaction;
}