import { rpcServer } from '../rpc';
import { Transaction } from '../transaction';

rpcServer.registerMethod('sendTransaction', async (params) => {
  const { signedTransaction } = params;

  // 1. Decode the base64-encoded transaction data
  const txData = Buffer.from(signedTransaction, 'base64');
  const tx = Transaction.fromBytes(txData);

  // 2. Verify the transaction signature
  if (!tx.verify()) {
    throw new Error('Invalid transaction signature');
  }

  // 3. Check the transaction nonce to prevent replays
  if (await tx.getNonce() !== await tx.getAccountNonce()) {
    throw new Error('Transaction nonce mismatch');
  }

  // 4. Validate the transaction contents
  // (e.g., valid contract, enough gas, etc.)
  if (!tx.isValid()) {
    throw new Error('Invalid transaction');
  }

  // 5. Add the transaction to the mempool for processing
  await tx.addToMempool();

  return { success: true };
});