import { Transaction, TransactionLogs, ComputeUnits } from '../types';
import { executeTransaction } from '../vm';

export async function simulateTransaction(
  transaction: Transaction
): Promise<{ logs: TransactionLogs, computeUnits: ComputeUnits }> {
  const { logs, computeUnits } = await executeTransaction(transaction);
  return { logs, computeUnits };
}