import WebSocket from 'ws';
import { Block } from './block';
import { Transaction } from './transaction';
import { Event } from './event';
import { BlockExplorer } from './BlockExplorer';

class WebSocketSubscriptions {
  private clients: Map<WebSocket, Set<string>> = new Map();
  private blockExplorer: BlockExplorer;

  constructor() {
    this.blockExplorer = new BlockExplorer();
  }

  subscribe(ws: WebSocket, topic: string) {
    if (!this.clients.has(ws)) {
      this.clients.set(ws, new Set());
    }
    this.clients.get(ws)!.add(topic);
  }

  unsubscribe(ws: WebSocket, topic: string) {
    if (this.clients.has(ws)) {
      this.clients.get(ws)!.delete(topic);
    }
  }

  async broadcastNewBlock(block: Block) {
    const blockData = await this.blockExplorer.getBlockData(block.hash);
    this.broadcast('newHeads', blockData);
  }

  broadcastLogs(events: Event[]) {
    this.broadcast('logs', events);
  }

  broadcastPendingTransactions(transactions: Transaction[]) {
    this.broadcast('pendingTransactions', transactions);
  }

  private broadcast(topic: string, data: any) {
    for (const [ws, subscriptions] of this.clients) {
      if (subscriptions.has(topic) && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: topic, data }));
      }
    }
  }
}

export default WebSocketSubscriptions;