import { TransactionGossip } from '../src/claw-generated/transaction_gossip';
import { PeerManager } from '../src/claw-generated/peer_manager';
import { Transaction } from '../src/types';

describe('TransactionGossip', () => {
  it('should add a new transaction to the mempool and broadcast it', () => {
    const peerManager = new PeerManager();
    const transactionGossip = new TransactionGossip(peerManager);

    const tx = new Transaction({
      // transaction data
    });

    transactionGossip.addTransaction(tx);

    expect(transactionGossip.mempool.size).toBe(1);
    expect(transactionGossip.mempool.has(tx.hash())).toBe(true);
    // add more assertions to verify broadcasting
  });
});