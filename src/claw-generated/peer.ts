import { Connection } from './connection';

export class Peer {
  public connection: Connection;
  public status: 'connected' | 'disconnected' = 'disconnected';

  constructor(public id: string) {
    this.connection = new Connection(this.id);
  }

  connect() {
    // Establish a connection to the peer
    this.connection.connect();
    this.status = 'connected';
  }

  disconnect() {
    // Close the connection to the peer
    this.connection.disconnect();
    this.status = 'disconnected';
  }
}