import { createServer, Server, Socket } from 'net';
import { randomUUID } from 'crypto';

class PeerDiscoveryServer {
  private server: Server;
  private peers: Map<string, Socket> = new Map();

  constructor() {
    this.server = createServer((socket) => {
      const peerId = randomUUID();
      this.peers.set(peerId, socket);

      socket.on('data', (data) => {
        // Handle incoming peer messages
      });

      socket.on('close', () => {
        this.peers.delete(peerId);
      });
    });

    this.server.listen(3000);
  }

  broadcastToPeers(message: string) {
    for (const peer of this.peers.values()) {
      peer.write(message);
    }
  }
}

export default PeerDiscoveryServer;