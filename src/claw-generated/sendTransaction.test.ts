import { SendTransactionRPC } from './sendTransaction';
import { TransactionValidator } from '../validator';
import { NetworkBroadcaster } from '../network';

describe('SendTransactionRPC', () => {
  let rpc: SendTransactionRPC;

  beforeEach(() => {
    const validator = new TransactionValidator();
    const broadcaster = new NetworkBroadcaster();
    rpc = new SendTransactionRPC(validator, broadcaster);
  });

  it('should handle a valid transaction', async () => {
    const validTransaction = 'ABC123...'; // Replace with a valid base64-encoded transaction
    const result = await rpc.handleRequest(validTransaction);
    expect(result.success).toBe(true);
  });

  it('should handle an invalid transaction', async () => {
    const invalidTransaction = 'XYZ456...'; // Replace with an invalid base64-encoded transaction
    const result = await rpc.handleRequest(invalidTransaction);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid transaction');
  });
});