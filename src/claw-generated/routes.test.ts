import request from 'supertest';
import express from 'express';
import routes from './routes';

jest.mock('./chain', () => ({
  Chain: {
    getInstance: () => ({
      isSynced: () => true,
    }),
  },
  StateManager: {
    getInstance: () => ({}),
  },
}));

jest.mock('./TransactionPool', () => ({
  TransactionPool: {
    getInstance: () => ({
      isHealthy: () => true,
    }),
  },
}));

jest.mock('./peer_manager', () => ({
  PeerManager: {
    getInstance: () => ({
      isNetworkHealthy: () => true,
    }),
  },
}));

const app = express();
app.use(routes);

describe('Routes', () => {
  describe('/health', () => {
    it('should return 200 OK when healthy', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toEqual(200);
      expect(res.text).toEqual('Healthy');
    });

    it('should return 503 Service Unavailable when unhealthy', async () => {
      jest.spyOn(Chain.getInstance(), 'isSynced').mockReturnValue(false);
      const res = await request(app).get('/health');
      expect(res.status).toEqual(503);
      expect(res.text).toEqual('Unhealthy');
    });
  });

  describe('/ready', () => {
    it('should return 200 OK when ready', async () => {
      const res = await request(app).get('/ready');
      expect(res.status).toEqual(200);
      expect(res.text).toEqual('Ready');
    });

    it('should return 503 Service Unavailable when not ready', async () => {
      jest.spyOn(Chain.getInstance(), 'isSynced').mockReturnValue(false);
      const res = await request(app).get('/ready');
      expect(res.status).toEqual(503);
      expect(res.text).toEqual('Not Ready');
    });
  });
});