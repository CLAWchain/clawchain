import { Peer } from './peer';
import { CompactBlock } from './compact-block';
import { Block } from '../blockchain/block';
import { Transaction } from '../blockchain/transaction';

export class BlockPropagation {
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

  broadcastBlock(block: Block) {
    const compactBlock = new CompactBlock(block);
    this.peers.forEach(peer => {
      peer.sendMessage({ type: 'compact-block', data: compactBlock.toBuffer() });
    });
  }

  requestCompactBlock(peer: Peer, blockHash: string) {
    peer.sendMessage({ type: 'request-compact-block', data: blockHash });
  }

  handleCompactBlockResponse(peer: Peer, buffer: Buffer) {
    const compactBlock = CompactBlock.fromBuffer(buffer);
    // Reconstruct the full block and process it
  }
}