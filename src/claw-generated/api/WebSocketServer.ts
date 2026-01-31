import WebSocket, { WebSocketServer } from 'ws';
import { TransactionService } from '../TransactionService';
import { BlockService } from '../BlockService';
import { ChainService } from '../ChainService';
import { WebSocketSubscriptions } from './WebSocketSubscriptions';

export class ClawWebSocketServer {
  private wss: WebSocketServer;
  private subscriptions: WebSocketSubscriptions;

  constructor() {
    this.subscriptions = new WebSocketSubscriptions(
      new BlockService(),
      new TransactionService()
    );

    this.wss = new WebSocketServer({ port: 8080 });

    this.wss.on('connection', (ws) => {
      console.log('WebSocket client connected');

      // Subscribe the client to newHeads, logs, and pendingTransactions
      this.subscriptions.subscribeToNewHeads();
      this.subscriptions.subscribeToLogs('0x1234567890abcdef');
      this.subscriptions.subscribeToPendingTransactions();

      this.subscriptions.on('newHeads', (head) => {
        ws.send(JSON.stringify({ type: 'newHeads', data: head }));
      });

      this.subscriptions.on('logs', (tx) => {
        ws.send(JSON.stringify({ type: 'logs', data: tx }));
      });

      this.subscriptions.on('pendingTransactions', (tx) => {
        ws.send(JSON.stringify({ type: 'pendingTransactions', data: tx }));
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
      });
    });

    console.log('WebSocket server started on port 8080');
  }
}