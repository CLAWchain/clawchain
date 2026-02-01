import { PeerManager } from './peer_manager';
import { PeerConnection } from './peer_connection';
import { Block } from '../blockchain/block';

export class BlockPropagator {
  private peerManager: PeerManager;

  constructor(peerManager: PeerManager) {
    this.peerManager = peerManager;
  }

  propagateBlock(block: Block) {
    // Implement logic to efficiently broadcast the new block to all peers
    // using compact block relay or other optimization techniques
    this.peerManager.broadcastToAll(block);
  }
}