import { RPCServer } from './rpc';
import { TransactionPool } from '../blockchain/transaction-pool';
import { BlockStore } from '../blockchain/block-store';
import { Transaction } from '../blockchain/transaction';

describe('RPCServer', () => {
  let rpcServer: RPCServer;
  let transactionPool: TransactionPool;
  let blockStore: BlockStore;

  beforeEach(() => {
    transactionPool = new TransactionPool();
    blockStore = new BlockStore();
    rpcServer = new RPCServer(transactionPool, blockStore);
  });

  it('should return a transaction from the transaction pool', async () => {
    const tx = new Transaction({
      signature: 'test-signature',
      metadata: { fee: 0.001 }
    });
    transactionPool.addTransaction(tx);

    const result = await rpcServer.getTransaction('test-signature');
    expect(result).toEqual(tx);
  });
});