import { Transaction, TransactionReceipt, TransactionExecutionResult } from '../transaction';
import { getTransaction as getTransactionFromDB } from '../getTransaction';
import { executeTransaction } from '../vm';

export async function getTransaction(signature: string): Promise<Transaction | null> {
  const transaction = await getTransactionFromDB(signature);
  return transaction;
}

export async function simulateTransaction(
  transactionData: string,
  senderAddress: string,
  blockHeight: number
): Promise<TransactionExecutionResult> {
  const transaction = Transaction.fromData(transactionData);
  const result = await executeTransaction(transaction, senderAddress, blockHeight);
  return result;
}