import { Transaction } from '../types';

export async function sendTransaction(rawTransaction: string): Promise<string> {
  try {
    // 1. Decode the base64-encoded transaction data
    const transaction = Transaction.fromBase64(rawTransaction);

    // 2. Validate the transaction
    await transaction.validate();

    // 3. Submit the transaction to the network
    await transaction.submit();

    // 4. Return the transaction hash
    return transaction.hash;
  } catch (error) {
    console.error('Error processing sendTransaction:', error);
    throw error;
  }
}