import { Node } from './node';

export class RoutingTable {
  nodes: Node[] = [];

  addNode(node: Node) {
    this.nodes.push(node);
  }

  removeNode(node: Node) {
    this.nodes = this.nodes.filter(n => n.id !== node.id);
  }

  findClosestNodes(targetId: string, limit: number): Node[] {
    // Implement Kademlia distance-based sorting and limiting
    return this.nodes.sort((a, b) => this.distance(a.id, targetId) - this.distance(b.id, targetId)).slice(0, limit);
  }

  private distance(id1: string, id2: string): number {
    // Implement Kademlia XOR distance metric
    return 0;
  }
}