import { IncomingMessage, ServerResponse } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import JsonRpcServer from './JsonRpcServer';
import { Transaction } from './transaction';
import { BlockExplorer } from './BlockExplorer';
import WebSocketSubscriptions from './WebSocketSubscriptions';
import { TransactionPool } from './transaction-pool';

class WebSocketServer extends JsonRpcServer {
  private wss: WebSocketServer;
  private transactionPool: TransactionPool;
  private subscriptions: WebSocketSubscriptions;

  constructor() {
    super();
    this.wss = new WebSocketServer({ port: 8080 });
    this.transactionPool = new TransactionPool();
    this.subscriptions = new WebSocketSubscriptions();

    this.wss.on('connection', (ws, req) => {
      console.log('WebSocket connection established');
      ws.on('message', (data) => {
        this.handleWebSocketMessage(ws, data.toString());
      });
    });

    this.registerSubscriptionHandlers();
    this.startTransactionFeed();
  }

  handleWebSocketMessage(ws: WebSocket, message: string) {
    try {
      const jsonRpcRequest = JSON.parse(message);
      const jsonRpcResponse = this.handleJsonRpcRequest(jsonRpcRequest);
      ws.send(JSON.stringify(jsonRpcResponse));
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
      ws.send(JSON.stringify({ error: 'Invalid JSON-RPC request' }));
    }
  }

  registerSubscriptionHandlers() {
    this.registerSubscription('subscribe', (params, ws) => {
      this.subscriptions.subscribe(ws, params.topic);
      return { result: 'Subscribed' };
    });

    this.registerSubscription('unsubscribe', (params, ws) => {
      this.subscriptions.unsubscribe(ws, params.topic);
      return { result: 'Unsubscribed' };
    });

    this.registerSubscription('pendingTransactions', (params, ws) => {
      const pendingTransactions = this.transactionPool.getPendingTransactions();
      return { result: pendingTransactions };
    });
  }

  registerSubscription(name: string, handler: (params: any, ws: WebSocket) => any) {
    this.methodHandlers[name] = (params) => {
      this.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          const result = handler(params, client);
          if (result !== null) {
            client.send(JSON.stringify(result));
          }
        }
      });
      return null;
    };
  }

  private startTransactionFeed() {
    setInterval(async () => {
      // Check for new transactions in the mempool
      const newTransactions = await this.transactionPool.getPendingTransactions();
      this.subscriptions.broadcastPendingTransactions(newTransactions);
    }, 1000);
  }
}

export default WebSocketServer;