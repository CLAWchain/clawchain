import { simulateTransaction } from '../simulateTransaction';
import { Transaction, TransactionLogs, ComputeUnits } from '../../types';

describe('simulateTransaction', () => {
  it('should simulate a transaction and return logs and compute units', async () => {
    const transaction: Transaction = {
      // Provide a sample transaction object
    };

    const { logs, computeUnits } = await simulateTransaction(transaction);

    expect(logs).toBeDefined();
    expect(computeUnits).toBeDefined();
  });

  it('should encode the response in base64 format', async () => {
    const transaction: Transaction = {
      // Provide a sample transaction object
    };

    const { logs, computeUnits } = await simulateTransaction(transaction, 'base64');

    expect(typeof logs).toBe('string');
    expect(typeof computeUnits).toBe('string');
  });
});