import { TransactionGossipProtocol } from './transaction_gossip';
import { Transaction } from '../transaction';
import { Mempool } from '../mempool';

describe('TransactionGossipProtocol', () => {
  let mempool: Mempool;
  let gossipProtocol: TransactionGossipProtocol;

  beforeEach(() => {
    mempool = new Mempool();
    gossipProtocol = new TransactionGossipProtocol(mempool);
  });

  it('should add new transactions to the Mempool and broadcast them', () => {
    const tx1 = new Transaction({ value: 100, recipient: 'recipient1' });
    gossipProtocol.broadcastTransaction(tx1);

    expect(mempool.has(tx1)).toBe(true);
    expect(PeerManager.getInstance().broadcastTransaction).toHaveBeenCalledWith(tx1);
  });

  it('should not re-broadcast transactions already sent', () => {
    const tx1 = new Transaction({ value: 100, recipient: 'recipient1' });
    gossipProtocol.broadcastTransaction(tx1);
    gossipProtocol.broadcastTransaction(tx1);

    expect(mempool.has(tx1)).toBe(true);
    expect(PeerManager.getInstance().broadcastTransaction).toHaveBeenCalledTimes(1);
  });

  it('should add new received transactions to the Mempool and broadcast them', () => {
    const tx1 = new Transaction({ value: 100, recipient: 'recipient1' });
    gossipProtocol.receivedTransaction(tx1);

    expect(mempool.has(tx1)).toBe(true);
    expect(PeerManager.getInstance().broadcastTransaction).toHaveBeenCalledWith(tx1);
  });

  it('should not re-add transactions already in the Mempool', () => {
    const tx1 = new Transaction({ value: 100, recipient: 'recipient1' });
    mempool.addTransaction(tx1);
    gossipProtocol.receivedTransaction(tx1);

    expect(mempool.has(tx1)).toBe(true);
    expect(PeerManager.getInstance().broadcastTransaction).not.toHaveBeenCalled();
  });
});