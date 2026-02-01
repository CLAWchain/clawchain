import { Peer } from './peer';

export class NetworkManager {
  private peers: Map<string, Peer> = new Map();

  addPeer(peer: Peer) {
    this.peers.set(peer.id, peer);
  }

  removePeer(peerId: string) {
    this.peers.delete(peerId);
  }

  getPeer(peerId: string): Peer | undefined {
    return this.peers.get(peerId);
  }

  banPeer(peerId: string) {
    const peer = this.getPeer(peerId);
    if (peer) {
      peer.reportMisbehavior();
      if (peer.isBanned()) {
        this.removePeer(peerId);
      }
    }
  }

  reportGoodPeerBehavior(peerId: string) {
    const peer = this.getPeer(peerId);
    if (peer) {
      peer.reportGoodBehavior();
    }
  }
}