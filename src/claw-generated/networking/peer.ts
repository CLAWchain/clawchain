export class Peer {
  private socket: WebSocket;

  constructor(socket: WebSocket) {
    this.socket = socket;
  }

  send(message: any) {
    this.socket.send(JSON.stringify(message));
  }

  disconnect() {
    this.socket.close();
  }
}