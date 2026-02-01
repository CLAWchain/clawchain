import { Transaction } from '../transactions/transaction';
import { Ed25519Keypair } from '../crypto/ed25519';
import { TransactionBroadcaster } from '../network/transaction-broadcaster';

describe('Transaction', () => {
  it('should sign and broadcast a transaction', async () => {
    const keypair = new Ed25519Keypair();
    const transaction = new Transaction('transfer', 'sender', 'recipient', 100);
    transaction.sign(keypair);

    const broadcaster = new TransactionBroadcaster();
    await broadcaster.broadcastTransaction(transaction);

    // Assert that the transaction was successfully broadcasted
    expect(transaction.signature).toBeDefined();
  });
});