import { createHash } from 'crypto';
import { Node, Contact } from './types';

function distance(id1: string, id2: string): number {
  const hash1 = createHash('sha256').update(id1).digest('hex');
  const hash2 = createHash('sha256').update(id2).digest('hex');
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    distance += Math.abs(parseInt(hash1[i], 16) - parseInt(hash2[i], 16));
  }
  return distance;
}

class DHTNode implements Node {
  id: string;
  contacts: Contact[];

  constructor(id: string) {
    this.id = id;
    this.contacts = [];
  }

  addContact(contact: Contact) {
    this.contacts.push(contact);
    this.contacts.sort((a, b) => distance(this.id, a.id) - distance(this.id, b.id));
  }

  getClosestContacts(key: string, limit: number): Contact[] {
    return this.contacts.slice(0, limit);
  }
}

export class KademliaDHT {
  bootstrapNodes: Contact[];
  nodes: DHTNode[];

  constructor(bootstrapNodes: Contact[]) {
    this.bootstrapNodes = bootstrapNodes;
    this.nodes = [];
  }

  addNode(node: DHTNode) {
    this.nodes.push(node);
  }

  findNode(key: string): DHTNode | undefined {
    return this.nodes.find(node => node.id === key);
  }

  joinNetwork(node: DHTNode) {
    // Connect to bootstrap nodes
    for (const bootstrapNode of this.bootstrapNodes) {
      // Perform Kademlia "FIND_NODE" RPC to get closest contacts
      const closestContacts = bootstrapNode.getClosestContacts(node.id, 8);
      // Add the closest contacts to the new node's contact list
      for (const contact of closestContacts) {
        node.addContact(contact);
      }
    }

    // Add the new node to the DHT
    this.addNode(node);
  }

  storeValue(key: string, value: any) {
    // Implement Kademlia value storage
  }

  getValue(key: string): any {
    // Implement Kademlia value retrieval
    return null;
  }
}