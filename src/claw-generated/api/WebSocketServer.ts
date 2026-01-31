import WebSocket, { WebSocketServer } from 'ws';
import { TransactionService } from '../TransactionService';
import { BlockService } from '../BlockService';
import { ChainService } from '../ChainService';

export class ClawWebSocketServer {
  private wss: WebSocketServer;
  private transactionService: TransactionService;
  private blockService: BlockService;
  private chainService: ChainService;

  constructor() {
    this.transactionService = new TransactionService();
    this.blockService = new BlockService();
    this.chainService = new ChainService();
    this.wss = new WebSocketServer({ port: 8080 });

    this.wss.on('connection', (ws) => {
      console.log('WebSocket client connected');

      // Subscribe the client to transaction, block, and newHeads updates
      this.transactionService.on('newTransaction', (tx) => {
        ws.send(JSON.stringify({ type: 'transaction', data: tx }));
      });

      this.blockService.on('newBlock', (block) => {
        ws.send(JSON.stringify({ type: 'block', data: block }));
      });

      this.chainService.on('newHead', (head) => {
        ws.send(JSON.stringify({ type: 'newHead', data: head }));
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
      });
    });

    console.log('WebSocket server started on port 8080');
  }
}