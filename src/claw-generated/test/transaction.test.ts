import { Wallet } from '../wallet';
import { Transaction } from '../transaction';
import { Network } from '../network';

describe('Transaction', () => {
  it('should sign and broadcast a transaction', () => {
    const wallet = new Wallet();
    const tx = new Transaction(wallet.publicKey, Uint8Array.from([1, 2, 3]), 100, 1);
    tx.sign(wallet);
    Network.broadcastTransaction(tx);
    // Expect the transaction to be broadcast successfully
  });
});