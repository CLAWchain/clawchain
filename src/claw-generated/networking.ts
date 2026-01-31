import { createServer, Server, Socket } from 'net';

export class NetworkManager {
  private server: Server;
  private clients: Set<Socket> = new Set();

  constructor() {
    this.server = createServer((socket) => {
      this.onClientConnect(socket);
    });
    this.server.listen(8000, () => {
      console.log('Network server listening on port 8000');
    });
  }

  private onClientConnect(socket: Socket) {
    console.log('Client connected');
    this.clients.add(socket);

    socket.on('data', (data) => {
      this.onClientMessage(socket, data);
    });

    socket.on('close', () => {
      this.onClientDisconnect(socket);
    });
  }

  private onClientMessage(socket: Socket, data: Buffer) {
    console.log('Received data:', data.toString());
    // Handle incoming messages from clients
  }

  private onClientDisconnect(socket: Socket) {
    console.log('Client disconnected');
    this.clients.delete(socket);
  }
}

new NetworkManager();