import { TransactionMempool } from './transaction_mempool';
import { TransactionGossipProtocol } from './transaction_gossip_protocol';
import { Peer } from './peer';
import { Transaction } from '../transaction';

describe('TransactionGossipProtocol', () => {
  let mempool: TransactionMempool;
  let gossipProtocol: TransactionGossipProtocol;
  let peer1: Peer;
  let peer2: Peer;

  beforeEach(() => {
    mempool = new TransactionMempool();
    gossipProtocol = new TransactionGossipProtocol(mempool);
    peer1 = new Peer();
    peer2 = new Peer();
    gossipProtocol.addPeer(peer1);
    gossipProtocol.addPeer(peer2);
  });

  it('should broadcast a new transaction to all peers', () => {
    const tx = new Transaction({ from: 'a', to: 'b', amount: 10 });
    gossipProtocol.broadcastTransaction(tx);

    expect(mempool.getTransaction(tx.hash())).toBeDefined();
    expect(peer1.hasTransaction(tx.hash())).toBe(true);
    expect(peer2.hasTransaction(tx.hash())).toBe(true);
  });

  it('should not broadcast a transaction twice to the same peer', () => {
    const tx = new Transaction({ from: 'a', to: 'b', amount: 10 });
    gossipProtocol.broadcastTransaction(tx);
    gossipProtocol.broadcastTransaction(tx);

    expect(mempool.getTransaction(tx.hash())).toBeDefined();
    expect(peer1.hasTransaction(tx.hash())).toBe(true);
    expect(peer2.hasTransaction(tx.hash())).toBe(true);
    expect(peer1.sendTransaction).toHaveBeenCalledTimes(1);
    expect(peer2.sendTransaction).toHaveBeenCalledTimes(1);
  });

  it('should respond to a transaction request', () => {
    const tx = new Transaction({ from: 'a', to: 'b', amount: 10 });
    mempool.addTransaction(tx);
    gossipProtocol.handleTransactionRequest(peer1, tx.hash());

    expect(peer1.sendTransaction).toHaveBeenCalledWith(tx);
  });
});