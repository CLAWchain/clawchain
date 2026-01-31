import { Block, Transaction } from '../blockchain';
import { Peer } from '../networking/peer_manager';

export class BlockPropagator {
  private peers: Peer[];

  constructor(peers: Peer[]) {
    this.peers = peers;
  }

  broadcastBlock(block: Block) {
    const compactBlock = {
      header: block.header,
      txIds: block.transactions.map(tx => tx.id)
    };

    for (const peer of this.peers) {
      peer.sendCompactBlock(compactBlock);
    }
  }

  handleCompactBlock(peer: Peer, compactBlock: {
    header: any,
    txIds: string[]
  }) {
    // Validate compact block header
    // Request missing transactions from peer
    // Assemble full block and add to chain
  }
}