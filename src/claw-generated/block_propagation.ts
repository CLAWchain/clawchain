import { Block } from '../blockchain/block';
import { Peer } from './peer';
import { CompactBlock } from './compact_block';

class BlockPropagation {
  private peers: Peer[] = [];

  constructor() {
    // Subscribe to new block events from the blockchain
    // TODO: Implement this
  }

  addPeer(peer: Peer) {
    this.peers.push(peer);
  }

  removePeer(peer: Peer) {
    this.peers = this.peers.filter(p => p !== peer);
  }

  broadcastBlock(block: Block) {
    const compactBlock = new CompactBlock(block);
    for (const peer of this.peers) {
      peer.sendCompactBlock(compactBlock);
    }
  }
}

export { BlockPropagation };