import { Mempool } from '../mempool';
import { Transaction } from '../transactions';
import { KademliaNode, KademliaDHT } from './kademlia';

class TransactionGossipProtocol {
  private mempool: Mempool;
  private kademlia: KademliaDHT;
  private seenTransactions: Set<string>;

  constructor(mempool: Mempool, kademlia: KademliaDHT) {
    this.mempool = mempool;
    this.kademlia = kademlia;
    this.seenTransactions = new Set();
  }

  async handleTransaction(transaction: Transaction): Promise<boolean> {
    const transactionId = transaction.getId();

    // Check if the transaction has already been seen
    if (this.seenTransactions.has(transactionId)) {
      return false;
    }

    // Add the transaction to the mempool
    const added = await this.mempool.addTransaction(transaction);
    if (!added) {
      return false;
    }

    // Mark the transaction as seen and broadcast it to peers
    this.seenTransactions.add(transactionId);
    await this.broadcastTransaction(transaction);

    return true;
  }

  private async broadcastTransaction(transaction: Transaction): Promise<void> {
    // Get the closest nodes in the Kademlia DHT
    const closestNodes = await this.kademlia.getClosestNodes(transaction.getId(), 3);

    // Send the transaction to the closest nodes
    for (const node of closestNodes) {
      await node.handleTransaction(transaction);
    }
  }
}

export { TransactionGossipProtocol };