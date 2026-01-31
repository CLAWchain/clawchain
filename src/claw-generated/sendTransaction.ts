import { Transaction } from '../transaction';
import { TransactionValidator } from '../validator';
import { NetworkBroadcaster } from '../network';

export class SendTransactionRPC {
  constructor(
    private validator: TransactionValidator,
    private broadcaster: NetworkBroadcaster
  ) {}

  async handleRequest(rawTransaction: string): Promise<{ success: boolean, error?: string }> {
    try {
      // 1. Decode the base64-encoded transaction
      const transaction = Transaction.fromBase64(rawTransaction);

      // 2. Validate the transaction
      if (!this.validator.isValid(transaction)) {
        return { success: false, error: 'Invalid transaction' };
      }

      // 3. Broadcast the transaction to the network
      await this.broadcaster.broadcast(transaction);

      return { success: true };
    } catch (error) {
      console.error('Error processing sendTransaction request:', error);
      return { success: false, error: 'Error processing transaction' };
    }
  }
}