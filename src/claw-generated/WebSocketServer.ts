import { IncomingMessage, ServerResponse } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import JsonRpcServer from './JsonRpcServer';
import { Transaction } from './transaction';
import { BlockExplorer } from './BlockExplorer';
import WebSocketSubscriptions from './WebSocketSubscriptions';
import { TransactionPool } from './transaction-pool';
import { Block } from './block';
import { LogEntry } from './event';

class WebSocketServer extends JsonRpcServer {
  private wss: WebSocketServer;
  private transactionPool: TransactionPool;
  private subscriptions: WebSocketSubscriptions;
  private blockExplorer: BlockExplorer;

  constructor() {
    super();
    this.wss = new WebSocketServer({ port: 8080 });
    this.transactionPool = new TransactionPool();
    this.subscriptions = new WebSocketSubscriptions();
    this.blockExplorer = new BlockExplorer();

    this.wss.on('connection', (ws, req) => {
      console.log('WebSocket connection established');
      ws.on('message', (data) => {
        this.handleWebSocketMessage(ws, data.toString());
      });

      ws.on('close', (code, reason) => {
        console.log('WebSocket connection closed:', code, reason);
        this.subscriptions.unsubscribeAll(ws);
      });

      ws.on('error', (err) => {
        console.error('WebSocket error:', err);
      });
    });

    this.registerSubscriptionHandlers();
    this.startTransactionFeed();
    this.startBlockFeed();
    this.startLogFeed();
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

    this.registerSubscription('newHeads', (params, ws) => {
      // Broadcast new block headers to all connected clients
      this.subscriptions.broadcastNewHeads(this.getLatestBlocks());
      return null;
    });

    this.registerSubscription('logs', (params, ws) => {
      // Broadcast new log entries to all connected clients
      this.subscriptions.broadcastLogs(this.getLatestLogEntries());
      return null;
    });

    this.registerSubscription('pendingTransactions', (params, ws) => {
      const pendingTransactions = this.transactionPool.getPendingTransactions();
      return { result: pendingTransactions };
    });

    // Add new subscription handler for real-time transaction feed
    this.registerSubscription('transactionFeed', (params, ws) => {
      // Broadcast new transactions to the subscriber
      this.subscriptions.broadcastTransactionFeed(this.getRecentTransactions());
      return null;
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
      this.subscriptions.broadcastTransactionFeed(newTransactions);
    }, 1000);
  }

  private startBlockFeed() {
    setInterval(async () => {
      // Broadcast new block headers
      const latestBlocks = await this.getLatestBlocks();
      this.subscriptions.broadcastNewHeads(latestBlocks);
    }, 5000);
  }

  private startLogFeed() {
    setInterval(async () => {
      // Broadcast new log entries
      const latestLogEntries = await this.getLatestLogEntries();
      this.subscriptions.broadcastLogs(latestLogEntries);
    }, 5000);
  }

  private async getRecentTransactions(): Promise<Transaction[]> {
    // Implement logic to fetch the most recent transactions
    // and return them as an array of Transaction objects
    const transactions = await this.transactionPool.getPendingTransactions();
    return transactions.slice(0, 10);
  }

  private async getLatestBlocks(): Promise<Block[]> {
    // Implement logic to fetch the latest block headers
    // and return them as an array of Block objects
    const blocks = await this.blockExplorer.getLatestBlocks(10);
    return blocks.map((block) => ({
      number: block.number,
      hash: block.hash,
      parentHash: block.parentHash,
      timestamp: block.timestamp,
    }));
  }

  private async getLatestLogEntries(): Promise<LogEntry[]> {
    // Implement logic to fetch the latest log entries
    // and return them as an array of LogEntry objects
    const logEntries = await this.blockExplorer.getLatestLogEntries(10);
    return logEntries.map((entry) => ({
      blockNumber: entry.blockNumber,
      logIndex: entry.logIndex,
      address: entry.address,
      topics: entry.topics,
      data: entry.data,
    }));
  }
}

export default WebSocketServer;