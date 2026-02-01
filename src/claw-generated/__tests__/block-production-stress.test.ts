import { Block, Transaction } from '../types';
import { Blockchain } from '../blockchain/blockchain';
import { PeerManager } from '../networking/peer_manager';

describe('Block Production Stress Tests', () => {
  let blockchain: Blockchain;

  beforeEach(() => {
    const peerManager = new PeerManager();
    blockchain = new Blockchain(peerManager);
  });

  it('should handle high transaction load', async () => {
    // Generate a large number of transactions
    const numTransactions = 10000;
    const transactions = generateTransactions(numTransactions);

    // Process the transactions and add them to blocks
    const blocks: Block[] = [];
    for (let i = 0; i < numTransactions; i += 100) {
      const txBatch = transactions.slice(i, i + 100);
      const block = new Block(
        blockchain.getLatestBlock().hash,
        txBatch,
        Date.now(),
        0,
        '0x0'
      );
      blocks.push(block);
    }

    // Add the blocks to the blockchain
    blockchain.addBlocks(blocks);

    // Verify that the system can handle the load
    expect(blockchain.getLatestBlock().number).toEqual(numTransactions / 100);
  });
});

function generateTransactions(count: number): Transaction[] {
  const transactions: Transaction[] = [];
  for (let i = 0; i < count; i++) {
    transactions.push({
      hash: `0x${i.toString(16)}`,
      from: '0x0123456789012345678901234567890123456789',
      to: '0x9876543210987654321098765432109876543210',
      value: 1000,
      gas: 21000,
      gasPrice: 1,
      nonce: i,
      data: '0x'
    });
  }
  return transactions;
}