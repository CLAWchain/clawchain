import { Transaction } from '../transaction';

export async function sendTransaction(rawTransaction: string): Promise<string> {
  // 1. Decode the base64-encoded transaction
  const transaction = Transaction.fromBase64(rawTransaction);

  // 2. Validate the transaction
  await transaction.validate();

  // 3. Broadcast the transaction to the network
  await transaction.broadcast();

  // 4. Return the transaction hash
  return transaction.hash;
}