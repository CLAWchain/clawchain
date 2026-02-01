import { Transaction } from '@clawchain/types';
import { executeTransaction } from '@clawchain/runtime';

export async function simulateTransaction(txData: string): Promise<{
  logs: string[];
  computeUnits: number;
}> {
  // 1. Parse the transaction data
  const tx = Transaction.from(txData);

  // 2. Simulate the transaction execution
  const { logs, computeUnits } = await executeTransaction(tx);

  // 3. Return the simulation results
  return { logs, computeUnits };
}