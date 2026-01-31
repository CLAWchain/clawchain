import { Peer } from './peer';
import { BlockPropagation } from './block-propagation';
import { Block } from './block';

export class PeerManager {
  private peers: Peer[];
  private blockPropagation: BlockPropagation;

  constructor() {
    this.peers = [];
    this.blockPropagation = new BlockPropagation();
  }

  addPeer(peer: Peer) {
    this.peers.push(peer);
    this.blockPropagation.addPeer(peer);
  }

  removePeer(peer: Peer) {
    this.peers = this.peers.filter(p => p !== peer);
    this.blockPropagation.removePeer(peer);
  }

  broadcastBlock(block: Block) {
    this.blockPropagation.broadcastBlock(block);
  }

  requestCompactBlock(peer: Peer, blockHash: string) {
    this.blockPropagation.requestCompactBlock(peer, blockHash);
  }

  handleCompactBlockResponse(peer: Peer, buffer: Buffer) {
    this.blockPropagation.handleCompactBlockResponse(peer, buffer);
  }
}