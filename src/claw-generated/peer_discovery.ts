import { KademliaNode, KademliaRoutingTable } from './kademlia';
import net from 'net';

class PeerDiscoveryProtocol {
  private routingTable: KademliaRoutingTable;

  constructor() {
    this.routingTable = new KademliaRoutingTable();
  }

  async bootstrap(bootstrapNodes: string[]) {
    // Connect to bootstrap nodes and populate routing table
    for (const nodeAddress of bootstrapNodes) {
      const [host, port] = nodeAddress.split(':');
      const node = new KademliaNode(this.generateNodeId(host, port), host, parseInt(port));
      await this.connectToPeer(node);
      this.routingTable.addNode(node);
    }
  }

  async findPeers(targetId: string): Promise<KademliaNode[]> {
    // Use DHT to find closest nodes to the target ID
    return this.routingTable.findClosest(targetId);
  }

  async addPeer(node: KademliaNode) {
    // Add a new peer to the routing table
    this.routingTable.addNode(node);
  }

  async removePeer(nodeId: string) {
    // Remove a peer from the routing table
    this.routingTable.removeNode(nodeId);
  }

  private generateNodeId(host: string, port: string): string {
    // Generate a unique node ID based on the host and port
    return `${host}:${port}`;
  }

  private async connectToPeer(node: KademliaNode): Promise<void> {
    // Implement logic to connect to a peer node
    return new Promise((resolve, reject) => {
      const client = net.createConnection({ host: node.address, port: node.port }, () => {
        console.log(`Connected to peer: ${node.id}`);
        resolve();
      });

      client.on('error', (err) => {
        console.error(`Error connecting to peer ${node.id}: ${err}`);
        reject(err);
      });
    });
  }
}

export { PeerDiscoveryProtocol };