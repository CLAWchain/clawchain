import { createHash } from 'crypto';
import { Node } from './node';

class KademliaNode extends Node {
  constructor(id: string, address: string) {
    super(id, address);
  }

  distance(otherId: string): number {
    const selfHash = this.hash();
    const otherHash = KademliaNode.hash(otherId);
    return selfHash ^ otherHash;
  }

  static hash(input: string): number {
    return createHash('sha256').update(input).digest('number');
  }
}

export class KademliaDHT {
  private nodes: KademliaNode[] = [];
  private alpha = 3; // Concurrency factor
  private k = 20; // Bucket size

  addNode(node: KademliaNode) {
    this.nodes.push(node);
    this.nodes.sort((a, b) => a.distance(node.id) - b.distance(node.id));
  }

  findNode(id: string): KademliaNode | undefined {
    return this.nodes.find(node => node.id === id);
  }

  lookup(target: string): KademliaNode[] {
    const closestNodes = this.nodes.slice(0, this.k)
      .filter(node => node.id !== target)
      .sort((a, b) => a.distance(target) - b.distance(target));
    return closestNodes;
  }

  bootstrap(bootstrapNodes: KademliaNode[]) {
    for (const node of bootstrapNodes) {
      this.addNode(node);
    }
  }

  maintain() {
    // Periodically refresh buckets and replace stale nodes
  }
}