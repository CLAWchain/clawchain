import { TransactionGossip } from './transaction_gossip';
import { Transaction } from '../transactions/transaction';
import { Peer } from '../networking/peer';
import { MemPool } from '../mempool/mempool';

describe('TransactionGossip', () => {
  let memPool: MemPool;
  let peers: Peer[];
  let gossip: TransactionGossip;

  beforeEach(() => {
    memPool = new MemPool();
    peers = [
      new Peer('peer1', 'localhost:8001'),
      new Peer('peer2', 'localhost:8002'),
      new Peer('peer3', 'localhost:8003'),
    ];
    gossip = new TransactionGossip(memPool, peers);
  });

  test('should broadcast new transactions to relevant peers', () => {
    const tx1 = new Transaction(1, 100, 'sender', 'recipient');
    gossip.broadcastTransaction(tx1);

    expect(peers[0].sentTransactions).toContain(tx1);
    expect(peers[1].sentTransactions).toContain(tx1);
    expect(peers[2].sentTransactions).toContain(tx1);
  });

  test('should not broadcast transactions that have already been sent', () => {
    const tx1 = new Transaction(1, 100, 'sender', 'recipient');
    gossip.broadcastTransaction(tx1);

    // Reset sent transactions
    peers.forEach(peer => peer.sentTransactions = []);

    gossip.broadcastTransaction(tx1);

    expect(peers[0].sentTransactions).toHaveLength(0);
    expect(peers[1].sentTransactions).toHaveLength(0);
    expect(peers[2].sentTransactions).toHaveLength(0);
  });

  test('should handle incoming transactions', () => {
    const tx1 = new Transaction(1, 100, 'sender', 'recipient');
    gossip.handleIncomingTransaction(tx1, peers[0]);

    expect(memPool.has(tx1)).toBe(true);
    expect(peers[1].sentTransactions).toContain(tx1);
    expect(peers[2].sentTransactions).toContain(tx1);
  });

  test('should not re-add transactions already in the mempool', () => {
    const tx1 = new Transaction(1, 100, 'sender', 'recipient');
    memPool.add(tx1);
    gossip.handleIncomingTransaction(tx1, peers[0]);

    expect(memPool.size).toBe(1);
    expect(peers[1].sentTransactions).toHaveLength(0);
    expect(peers[2].sentTransactions).toHaveLength(0);
  });
});