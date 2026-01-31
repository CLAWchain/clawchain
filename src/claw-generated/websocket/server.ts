import WebSocket from 'ws';
import { EventEmitter } from 'events';

class WebSocketServer extends EventEmitter {
  private wss: WebSocket.Server;
  private subscriptions: Map<string, Set<WebSocket>> = new Map();

  constructor(port: number) {
    super();
    this.wss = new WebSocket.Server({ port });
    this.wss.on('connection', this.handleConnection.bind(this));
    this.wss.on('error', this.handleError.bind(this));
  }

  handleConnection(ws: WebSocket) {
    console.log('WebSocket connection established');

    ws.on('message', this.handleMessage.bind(this, ws));
    ws.on('close', this.handleDisconnection.bind(this, ws));
    ws.on('error', this.handleError.bind(this, ws));
  }

  handleMessage(ws: WebSocket, message: string) {
    try {
      const { action, topic } = JSON.parse(message);
      switch (action) {
        case 'subscribe':
          this.subscribe(ws, topic);
          break;
        case 'unsubscribe':
          this.unsubscribe(ws, topic);
          break;
        default:
          console.error('Unknown WebSocket action:', action);
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
      this.handleError(ws, err);
    }
  }

  handleDisconnection(ws: WebSocket) {
    for (const [topic, clients] of this.subscriptions) {
      clients.delete(ws);
    }
    console.log('WebSocket connection closed');
  }

  handleError(ws: WebSocket | WebSocket.Server, err: Error) {
    console.error('WebSocket error:', err);
    if (ws instanceof WebSocket) {
      ws.terminate();
    } else {
      this.wss.close();
    }
  }

  subscribe(ws: WebSocket, topic: string) {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
    }
    this.subscriptions.get(topic)!.add(ws);
    console.log(`Subscribed ${ws.url} to topic: ${topic}`);
  }

  unsubscribe(ws: WebSocket, topic: string) {
    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic)!.delete(ws);
      console.log(`Unsubscribed ${ws.url} from topic: ${topic}`);
    }
  }

  publish(topic: string, data: any) {
    if (this.subscriptions.has(topic)) {
      for (const ws of this.subscriptions.get(topic)!) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        } else {
          this.subscriptions.get(topic)!.delete(ws);
          console.log(`Removed closed WebSocket connection: ${ws.url}`);
        }
      }
    }
  }
}

export default WebSocketServer;