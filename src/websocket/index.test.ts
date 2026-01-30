import WebSocketManager from './index';
import WebSocket from 'ws';
import { getSignaturesForAddress, SignatureInfo } from '../rpc/transactions';
import { getAccountInfo } from '../rpc/account';
import { BlockchainManager } from '../blockchain/blockchain-manager';

jest.mock('../rpc/transactions', () => ({
  getSignaturesForAddress: jest.fn(),
  SignatureInfo: jest.fn()
}));

jest.mock('../rpc/account', () => ({
  getAccountInfo: jest.fn()
}));

jest.mock('../blockchain/blockchain-manager', () => ({
  BlockchainManager: jest.fn()
}));

describe('WebSocketManager', () => {
  let wss: WebSocketManager;
  let ws: WebSocket;

  beforeEach(() => {
    wss = new WebSocketManager(8080);
    ws = new WebSocket('ws://localhost:8080');
  });

  afterEach(() => {
    wss.wss.close();
    ws.close();
  });

  test('should handle WebSocket connection', (done) => {
    ws.on('open', () => {
      expect(wss.subscriptions.size).toBe(1);
      done();
    });
  });

  test('should handle subscription', (done) => {
    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'subscribe', params: { type: 'newHeads' } }));
      setTimeout(() => {
        expect(wss.subscriptions.get(ws)?.length).toBe(1);
        expect(wss.subscriptions.get(ws)?.[0].type).toBe('newHeads');
        done();
      }, 100);
    });
  });

  test('should handle unsubscription', (done) => {
    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'subscribe', params: { type: 'newHeads' } }));
      setTimeout(() => {
        ws.send(JSON.stringify({ type: 'unsubscribe', params: { type: 'newHeads' } }));
        setTimeout(() => {
          expect(wss.subscriptions.get(ws)?.length).toBe(0);
          done();
        }, 100);
      }, 100);
    });
  });

  test('should broadcast updates to subscribers', (done) => {
    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'subscribe', params: { type: 'newHeads' } }));
      setTimeout(() => {
        wss.onNewHead({ hash: 'abc123' });
        setTimeout(() => {
          expect(ws.readyState).toBe(WebSocket.OPEN);
          expect(ws.messages).toEqual([JSON.stringify({ type: 'newHeads', data: { hash: 'abc123' } })]);
          done();
        }, 100);
      }, 100);
    });
  });
});