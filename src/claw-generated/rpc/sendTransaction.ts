import { Transaction, AccountState } from '../transaction/transaction';
import { Base64 } from 'js-base64';
import { broadcastTransaction } from '../network/broadcaster';

export async function sendTransactionHandler(rawTransaction: string): Promise<{ success: boolean }> {
  try {
    // Decode base64 transaction data
    const transactionData = Base64.toUint8Array(rawTransaction);
    const transaction = new Transaction(
      transactionData.slice(0, 32),
      transactionData.slice(32, 64),
      transactionData.readUInt32BE(64),
      transactionData.readUInt32BE(68)
    );
    transaction.signature = transactionData.slice(72);

    // Validate transaction
    const accountState = await getAccountState(transaction.from);
    if (!transaction.verifyNonce(accountState)) {
      return { success: false, error: 'Invalid transaction nonce' };
    }
    if (!transaction.verifySignature()) {
      return { success: false, error: 'Invalid transaction signature' };
    }

    // Broadcast transaction to the network
    await broadcastTransaction(transaction);

    return { success: true };
  } catch (error) {
    console.error('Error processing sendTransaction:', error);
    return { success: false, error: 'Failed to process transaction' };
  }
}

async function getAccountState(address: Uint8Array): Promise<AccountState> {
  // Fetch account state from the database or other storage
  return new AccountState(address, 42);
}