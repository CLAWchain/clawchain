import WebSocket from 'ws';
import { Transaction } from './transaction';
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

  broadcastPendingTransactions(transactions: Transaction[]) {
    this.broadcast('pendingTransactions', { result: transactions });
  }

  broadcastNewHeads(blocks: Block[]) {
    this.broadcast('newHeads', { result: blocks });
  }

  broadcastLogs(logs: LogEntry[]) {
    this.broadcast('logs', { result: logs });
  }

  broadcastTransactionFeed(transactions: Transaction[]) {
    this.broadcast('transactionFeed', { result: transactions });
  }

  private broadcast(topic: string, data: any) {
    this.subscriptions.forEach((topics, ws) => {
      if (topics.has(topic) && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });
  }
}

export default WebSocketSubscriptions;