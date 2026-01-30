import WebSocket, { WebSocketServer } from 'ws';
import { getSignaturesForAddress, SignatureInfo } from '../rpc/transactions';
import { getAccountInfo } from '../rpc/account';
import { BlockchainManager } from '../blockchain/blockchain-manager';

interface Subscription {
  type: 'newHeads' | 'logs' | 'pendingTransactions';
  callback: (data: any) => void;
}

class WebSocketManager {
  private wss: WebSocketServer;
  private subscriptions: Map<WebSocket, Subscription[]> = new Map();

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.wss.on('connection', this.handleConnection.bind(this));
  }

  private handleConnection(ws: WebSocket) {
    console.log('WebSocket client connected');
    this.subscriptions.set(ws, []);

    ws.on('message', this.handleMessage.bind(this, ws));
    ws.on('close', this.handleDisconnection.bind(this, ws));
  }

  private handleMessage(ws: WebSocket, message: string) {
    try {
      const { type, params } = JSON.parse(message);
      switch (type) {
        case 'subscribe':
          this.handleSubscription(ws, params);
          break;
        case 'unsubscribe':
          this.handleUnsubscription(ws, params);
          break;
        default:
          console.error('Unknown WebSocket message type:', type);
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  }

  private handleSubscription(ws: WebSocket, params: any) {
    const { type } = params;
    const callback = this.getSubscriptionCallback(type, params);
    const subscription: Subscription = { type, callback };
    const subscriptions = this.subscriptions.get(ws) || [];
    subscriptions.push(subscription);
    this.subscriptions.set(ws, subscriptions);
    console.log(`Client subscribed to ${type} events`);
  }

  private handleUnsubscription(ws: WebSocket, params: any) {
    const { type } = params;
    const subscriptions = this.subscriptions.get(ws) || [];
    this.subscriptions.set(ws, subscriptions.filter(sub => sub.type !== type));
    console.log(`Client unsubscribed from ${type} events`);
  }

  private handleDisconnection(ws: WebSocket) {
    console.log('WebSocket client disconnected');
    this.subscriptions.delete(ws);
  }

  private getSubscriptionCallback(type: string, params: any): (data: any) => void {
    switch (type) {
      case 'newHeads':
        return this.onNewHead.bind(this);
      case 'logs':
        return this.onLog.bind(this, params.address);
      case 'pendingTransactions':
        return this.onPendingTransaction.bind(this);
      default:
        throw new Error(`Unknown subscription type: ${type}`);
    }
  }

  private onNewHead(block: any) {
    this.broadcastToSubscribers('newHeads', block);
  }

  private onLog(address: Uint8Array, log: any) {
    this.broadcastToSubscribers('logs', { address, log });
  }

  private onPendingTransaction(tx: any) {
    this.broadcastToSubscribers('pendingTransactions', tx);
  }

  private broadcastToSubscribers(type: string, data: any) {
    for (const [ws, subscriptions] of this.subscriptions) {
      const relevantSubscriptions = subscriptions.filter(sub => sub.type === type);
      if (relevantSubscriptions.length > 0) {
        const message = JSON.stringify({ type, data });
        ws.send(message);
      }
    }
  }
}

export default WebSocketManager;