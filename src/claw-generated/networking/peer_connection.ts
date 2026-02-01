import { PeerManager } from './peer_manager';

export class PeerConnection {
  private manager: PeerManager;

  constructor(manager: PeerManager) {
    this.manager = manager;
  }

  sendMessage(message: any) {
    // Implement logic to send message to peer
  }

  onMessage(message: any) {
    // Implement logic to handle incoming messages
  }

  disconnect() {
    this.manager.removePeer(this);
  }
}