import { PeerConnection } from './peer_connection';

export class PeerManager {
  private peers: PeerConnection[] = [];

  addPeer(peer: PeerConnection) {
    this.peers.push(peer);
  }

  removePeer(peer: PeerConnection) {
    this.peers = this.peers.filter(p => p !== peer);
  }

  broadcastToAll(message: any) {
    this.peers.forEach(peer => peer.sendMessage(message));
  }
}