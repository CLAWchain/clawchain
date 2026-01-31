import WebSocket from 'ws';
import { WebSocketServer } from './WebSocketServer';
import { WebSocketSubscriptions } from './WebSocketSubscriptions';
import { Block } from './Block';
import { Transaction } from './Transaction';

describe('WebSocketServer', () => {
  let wss: WebSocketServer;
  let wsSubscriptions: WebSocketSubscriptions;

  beforeEach(() => {
    wss = new WebSocketServer(8080);
    wsSubscriptions = new WebSocketSubscriptions(wss);
  });

  test('should handle new client connections', () => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.on('open', () => {
      expect(wss.clients.size).toBe(1);
      ws.close();
    });
  });

  test('should handle client subscriptions', () => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'subscribe', topic: 'newHeads' }));
      expect(wss.subscriptions.length).toBe(1);
      expect(wss.subscriptions[0].topic).toBe('newHeads');
      ws.close();
    });
  });

  test('should publish new block updates', () => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'subscribe', topic: 'newHeads' }));
      const block = new Block({ number: 1, hash: '0x1234' });
      wss.publishNewBlock(block);
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        expect(message.topic).toBe('newHeads');
        expect(message.data).toEqual(block);
        ws.close();
      });
    });
  });

  test('should publish new transaction updates', () => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'subscribe', topic: 'pendingTransactions' }));
      const tx = new Transaction({ hash: '0x5678' });
      wss.publishTransaction(tx);
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        expect(message.topic).toBe('pendingTransactions');
        expect(message.data).toEqual(tx);
        ws.close();
      });
    });
  });

  test('should publish new log updates', () => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'subscribe', topic: 'logs' }));
      const log = { address: '0x0123', data: '0x1234' };
      wss.publishLogUpdate(log);
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        expect(message.topic).toBe('logs');
        expect(message.data).toEqual(log);
        ws.close();
      });
    });
  });
});