import { Block } from '../blockchain/block';
import { Peer } from './peer';
import { Transaction } from '../blockchain/transaction';

class BlockPropagationManager {
  private peers: Peer[];

  constructor() {
    this.peers = [];
  }

  addPeer(peer: Peer) {
    this.peers.push(peer);
  }

  removePeer(peer: Peer) {
    this.peers = this.peers.filter(p => p !== peer);
  }

  onNewBlock(block: Block) {
    this.broadcastCompactBlock(block);
  }

  private broadcastCompactBlock(block: Block) {
    const compactBlock = this.createCompactBlock(block);
    const serializedCompactBlock = this.serializeCompactBlock(compactBlock);

    for (const peer of this.peers) {
      peer.sendCompactBlock(serializedCompactBlock);
      const missingTransactions = compactBlock.missingTransactions;
      if (missingTransactions.length > 0) {
        peer.sendMissingTransactions(missingTransactions);
      }
    }
  }

  private createCompactBlock(block: Block): CompactBlock {
    const transactions = block.transactions;
    const transactionIds = transactions.map(tx => tx.id);
    const missingTransactions = this.findMissingTransactions(transactions);

    return {
      blockHeader: block.header,
      transactionIds,
      missingTransactions
    };
  }

  private findMissingTransactions(transactions: Transaction[]): Transaction[] {
    // Implement logic to find transactions that are missing from the recipient's mempool
    return [];
  }

  private serializeCompactBlock(compactBlock: CompactBlock): string {
    // Implement serialization logic here
    return '';
  }
}

interface CompactBlock {
  blockHeader: BlockHeader;
  transactionIds: string[];
  missingTransactions: Transaction[];
}

export { BlockPropagationManager, CompactBlock };