import { Transaction } from '../types';
import { broadcastTransaction } from '../network';

export interface RPCMethods {
  sendTransaction: (rawTransaction: string) => Promise<string>;
}

export const rpcMethods: RPCMethods = {
  sendTransaction: async (rawTransaction: string): Promise<string> => {
    try {
      // 1. Decode the base64-encoded raw transaction
      const transaction = Transaction.from(Buffer.from(rawTransaction, 'base64'));

      // 2. Validate the transaction
      if (!transaction.verifySignatures()) {
        throw new Error('Invalid transaction signatures');
      }

      // 3. Broadcast the valid transaction to the network
      const txHash = await broadcastTransaction(transaction);
      return txHash;
    } catch (error) {
      console.error('Error processing sendTransaction RPC:', error);
      throw error;
    }
  }
};