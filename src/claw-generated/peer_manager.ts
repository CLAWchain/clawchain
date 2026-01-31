import { PeerInfo } from './peer_info';
import { PeerReputation } from './peer_reputation';

export class PeerManager {
  private peers: Map<string, PeerInfo> = new Map();

  addPeer(peer: PeerInfo) {
    this.peers.set(peer.id, peer);
    peer.reputation.addPeer(peer);
  }

  removePeer(peer: PeerInfo) {
    this.peers.delete(peer.id);
    peer.reputation.removePeer(peer);
  }

  updatePeerReputation(peer: PeerInfo, score: number) {
    peer.reputation.updateReputation(peer, score);
  }

  getBestPeers(count: number): PeerInfo[] {
    const peerArray = Array.from(this.peers.values());
    peerArray.sort((a, b) => b.reputation.getPeerReputation(b) - a.reputation.getPeerReputation(a));
    return peerArray.slice(0, count);
  }

  isBanned(peer: PeerInfo): boolean {
    return peer.reputation.isBanned(peer);
  }
}