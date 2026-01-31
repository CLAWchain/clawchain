import WebSocket from 'ws';
import { Block } from './block';
import { LogEntry } from './event';

class WebSocketSubscriptions {
  private subscriptions: Map<WebSocket, Set<string>>;

  constructor() {
    this.subscriptions = new Map();
  }

  subscribe(ws: WebSocket, topic: string) {
    if (!this.subscriptions.has(ws)) {
      this.subscriptions.set(ws, new Set());
    }
    this.subscriptions.get(ws)!.add(topic);
  }

  unsubscribe(ws: WebSocket, topic: string) {
    if (this.subscriptions.has(ws)) {
      this.subscriptions.get(ws)!.delete(topic);
    }
  }

  broadcastNewHeads(blocks: Block[]) {
    this.broadcast('newHeads', blocks);
  }

  broadcastLogs(logEntries: LogEntry[]) {
    this.broadcast('logs', logEntries);
  }

  broadcastPendingTransactions(transactions: any[]) {
    this.broadcast('pendingTransactions', transactions);
  }

  private broadcast(topic: string, data: any) {
    this.subscriptions.forEach((topics, ws) => {
      if (topics.has(topic) && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ jsonrpc: '2.0', method: topic, params: data }));
      }
    });
  }
}

export default WebSocketSubscriptions;