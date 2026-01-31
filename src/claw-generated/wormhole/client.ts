import WebSocket from 'ws';

export class WormholeClient {
  private ws: WebSocket;
  private rpcEndpoint: string;
  private messageCallbacks: ((message: any) => void)[] = [];

  constructor(rpcEndpoint: string) {
    this.rpcEndpoint = rpcEndpoint;
  }

  async connect() {
    this.ws = new WebSocket(this.rpcEndpoint);

    return new Promise<void>((resolve, reject) => {
      this.ws.on('open', () => {
        console.log('Connected to Wormhole RPC endpoint');
        resolve();
      });

      this.ws.on('error', (err) => {
        console.error('Error connecting to Wormhole RPC:', err);
        reject(err);
      });
    });
  }

  async disconnect() {
    return new Promise<void>((resolve) => {
      this.ws.close(() => {
        console.log('Disconnected from Wormhole RPC endpoint');
        resolve();
      });
    });
  }

  onMessage(callback: (message: any) => void) {
    this.messageCallbacks.push(callback);

    this.ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      this.messageCallbacks.forEach((cb) => cb(message));
    });
  }

  async sendMessage(message: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.ws.send(JSON.stringify(message), (err) => {
        if (err) {
          console.error('Error sending message to Wormhole RPC:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}