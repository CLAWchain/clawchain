import { Peer } from './peer';

export class ReputationManager {
  private peers: Map<string, Peer>;

  constructor() {
    this.peers = new Map();
  }

  addPeer(peer: Peer) {
    this.peers.set(peer.info.id, peer);
  }

  removePeer(peerId: string) {
    this.peers.delete(peerId);
  }

  getPeer(peerId: string): Peer | undefined {
    return this.peers.get(peerId);
  }

  updatePeerReputation(peerId: string, delta: number) {
    const peer = this.getPeer(peerId);
    if (peer) {
      peer.updateReputation(delta);
    }
  }

  getBannedPeers(): Peer[] {
    return [...this.peers.values()].filter((peer) => peer.isBanned());
  }
}