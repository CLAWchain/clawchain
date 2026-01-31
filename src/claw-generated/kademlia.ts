import crypto from 'crypto';

class KademliaNode {
  id: string;
  address: string;
  port: number;

  constructor(id: string, address: string, port: number) {
    this.id = id;
    this.address = address;
    this.port = port;
  }
}

class KademliaRoutingTable {
  private nodes: Map<string, KademliaNode>;

  constructor() {
    this.nodes = new Map();
  }

  addNode(node: KademliaNode) {
    this.nodes.set(node.id, node);
  }

  removeNode(nodeId: string) {
    this.nodes.delete(nodeId);
  }

  findClosest(targetId: string): KademliaNode[] {
    // Implement Kademlia's distance-based routing to find closest nodes
    const distances = new Map<string, number>();
    for (const node of this.nodes.values()) {
      const distance = this.distance(targetId, node.id);
      distances.set(node.id, distance);
    }

    // Sort nodes by distance and return the closest ones
    const sortedNodes = Array.from(distances.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([nodeId]) => this.nodes.get(nodeId)!);
    return sortedNodes.slice(0, 3);
  }

  private distance(id1: string, id2: string): number {
    // Calculate the XOR distance between two node IDs
    const buf1 = Buffer.from(id1, 'hex');
    const buf2 = Buffer.from(id2, 'hex');
    const xor = new Uint8Array(buf1.length);
    for (let i = 0; i < buf1.length; i++) {
      xor[i] = buf1[i] ^ buf2[i];
    }
    return this.intFromBytes(xor);
  }

  private intFromBytes(bytes: Uint8Array): number {
    // Convert a byte array to a number
    let value = 0;
    for (const b of bytes) {
      value = (value << 8) + b;
    }
    return value;
  }
}

export { KademliaNode, KademliaRoutingTable };