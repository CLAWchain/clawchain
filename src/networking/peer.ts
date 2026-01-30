import { Block } from '../state/block';

export class Peer {
  public id: string;
  public address: string;
  public port: number;
  public connected: boolean;

  constructor(id: string, address: string, port: number) {
    this.id = id;
    this.address = address;
    this.port = port;
    this.connected = false;
  }

  connect() {
    // Connect to the peer and set connected to true
    this.connected = true;
  }

  disconnect() {
    // Disconnect from the peer and set connected to false
    this.connected = false;
  }

  requestBlocks(hashes: string[]): Promise<Block[]> {
    // Request the specified blocks from the peer
    // and return a Promise that resolves with the blocks
    return Promise.resolve([]);
  }
}