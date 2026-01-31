import { PeerManager } from './peer_manager';
import { Peer } from './peer';
import { Block } from '../core/block';

export class BlockPropagator {
  private peerManager: PeerManager;

  constructor(peerManager: PeerManager) {
    this.peerManager = peerManager;
  }

  broadcastBlock(block: Block) {
    const peers = this.peerManager.getPeers();
    peers.forEach(peer => this.sendBlockToPeer(peer, block));
  }

  private sendBlockToPeer(peer: Peer, block: Block) {
    // TODO: Implement compact block relay to efficiently send the block to the peer
  }
}