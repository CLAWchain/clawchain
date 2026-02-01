import { Node, NodeId, PeerInfo } from './types';
import { distance, xor } from './utils';

class KademliaNode implements Node {
  id: NodeId;
  routingTable: PeerInfo[];
  bootstrapNodes: PeerInfo[];
  dataStore: Map<string, any>;

  constructor(id: NodeId, bootstrapNodes: PeerInfo[]) {
    this.id = id;
    this.routingTable = [];
    this.bootstrapNodes = bootstrapNodes;
    this.dataStore = new Map();
  }

  findClosestNodes(key: string, count: number): PeerInfo[] {
    // Convert the key to a NodeId
    const targetId = this.keyToId(key);

    // Initialize a priority queue with the node's own info
    const closestNodes: PeerInfo[] = [{ id: this.id, address: '' }];

    // Recursively query the routing table and other nodes
    this.findClosestNodesRecursive(targetId, count, closestNodes);

    // Return the k closest nodes
    return closestNodes.slice(0, count);
  }

  private findClosestNodesRecursive(
    targetId: NodeId,
    count: number,
    closestNodes: PeerInfo[]
  ): void {
    // Sort the routing table by distance to the target ID
    this.routingTable.sort((a, b) => distance(a.id, targetId) - distance(b.id, targetId));

    // Add the closest nodes from the routing table to the priority queue
    for (const node of this.routingTable) {
      if (closestNodes.length < count || distance(node.id, targetId) < distance(closestNodes[closestNodes.length - 1].id, targetId)) {
        closestNodes.push(node);
        closestNodes.sort((a, b) => distance(a.id, targetId) - distance(b.id, targetId));
        if (closestNodes.length > count) {
          closestNodes.pop();
        }
      }
    }

    // If we haven't found enough nodes, recursively query the closest nodes
    if (closestNodes.length < count) {
      for (const node of closestNodes.slice(0, 3)) {
        // TODO: Query the closest nodes and update the priority queue
      }
    }
  }

  private keyToId(key: string): NodeId {
    // Use a simple hash function to convert the key to a node ID
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
  }

  store(key: string, value: any): void {
    // Store the key-value pair in the local data store
    this.dataStore.set(key, value);

    // Find the k closest nodes and replicate the data
    const closestNodes = this.findClosestNodes(key, 3);
    for (const node of closestNodes) {
      // TODO: Replicate the data to the closest nodes
    }
  }

  retrieve(key: string): any {
    // Check if the data is stored locally
    if (this.dataStore.has(key)) {
      return this.dataStore.get(key);
    }

    // Find the k closest nodes and retrieve the data
    const closestNodes = this.findClosestNodes(key, 3);
    for (const node of closestNodes) {
      // TODO: Retrieve the data from the closest nodes
    }

    // If the data is not found, return null
    return null;
  }

  joinNetwork(): void {
    // Implement node join logic, connecting to bootstrap nodes
  }

  leaveNetwork(): void {
    // Implement node departure logic, notifying other nodes
  }
}

export { KademliaNode };