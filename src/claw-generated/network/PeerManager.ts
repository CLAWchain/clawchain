import { peerConnections } from '../metrics-manager';

class PeerManager {
  // Existing code...

  addPeer(peer: Peer) {
    // Existing peer addition logic...

    // Update metrics
    peerConnections.inc();
  }

  removePeer(peer: Peer) {
    // Existing peer removal logic...

    // Update metrics
    peerConnections.dec();
  }
}