import { simulateTransaction } from './simulate_transaction';

describe('simulateTransaction', () => {
  it('should simulate a transaction and return logs and compute units', async () => {
    const sampleTx = '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const { logs, computeUnits } = await simulateTransaction(sampleTx);
    expect(logs).toEqual(['Log 1', 'Log 2']);
    expect(computeUnits).toBeGreaterThan(0);
  });
}