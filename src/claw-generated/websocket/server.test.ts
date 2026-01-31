import WebSocket from 'ws';
import WebSocketServer from './server';
import WebSocketSubscriptions from './subscriptions';
import { BlockHeader, Log, Transaction } from '../types';

describe('WebSocketServer', () => {
  let server: WebSocketServer;
  let subscriptions: WebSocketSubscriptions;

  beforeEach(() => {
    server = new WebSocketServer(8080);
    subscriptions = new WebSocketSubscriptions(server);
  });

  afterEach(() => {
    server.wss.close();
  });

  test('should subscribe and publish newHeads', (done) => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.on('open', () => {
      ws.send(JSON.stringify({ action: 'subscribe', topic: 'newHeads' }));
    });

    ws.on('message', (data) => {
      const header: BlockHeader = JSON.parse(data.toString());
      expect(header.number).toBe(42);
      done();
    });

    subscriptions.onNewHeads({ number: 42 } as BlockHeader);
  });

  test('should subscribe and publish logs', (done) => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.on('open', () => {
      ws.send(JSON.stringify({ action: 'subscribe', topic: 'logs' }));
    });

    ws.on('message', (data) => {
      const logs: Log[] = JSON.parse(data.toString());
      expect(logs.length).toBe(2);
      done();
    });

    subscriptions.onLogs([
      { address: '0x123', topics: [], data: '0x456' },
      { address: '0x789', topics: [], data: '0xabc' },
    ]);
  });

  test('should subscribe and publish pendingTransactions', (done) => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.on('open', () => {
      ws.send(JSON.stringify({ action: 'subscribe', topic: 'pendingTransactions' }));
    });

    ws.on('message', (data) => {
      const txs: Transaction[] = JSON.parse(data.toString());
      expect(txs.length).toBe(2);
      done();
    });

    subscriptions.onPendingTransactions([
      { to: '0x123', value: 100 },
      { to: '0x456', value: 200 },
    ]);
  });
});