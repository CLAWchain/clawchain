import { Transaction, TransactionLogs, ComputeUnits } from '../types';
import { simulateTransaction as dbSimulateTransaction } from '../db';

export async function simulateTransaction(
  transaction: Transaction,
  encoding: 'json' | 'base64' = 'json'
): Promise<{ logs: TransactionLogs, computeUnits: ComputeUnits }> {
  const { logs, computeUnits } = await dbSimulateTransaction(transaction);

  if (encoding === 'base64') {
    return {
      logs: Buffer.from(JSON.stringify(logs)).toString('base64'),
      computeUnits: Buffer.from(JSON.stringify(computeUnits)).toString('base64')
    };
  }

  return { logs, computeUnits };
}