import request from 'supertest';
import { main } from './server';
import { Chain } from '../blockchain/Chain';

jest.mock('../blockchain/Chain', () => ({
  Chain: {
    getInstance: jest.fn(() => ({
      isSynced: jest.fn(() => true)
    }))
  }
}));

describe('API Server', () => {
  let app: any;

  beforeAll(async () => {
    await main();
    app = request(app);
  });

  it('should return 200 for /health', async () => {
    const response = await app.get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('should return 200 for /ready when chain is synced', async () => {
    const response = await app.get('/ready');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ready' });
  });

  it('should return 503 for /ready when chain is not synced', async () => {
    jest.spyOn(Chain.getInstance(), 'isSynced').mockReturnValue(false);
    const response = await app.get('/ready');
    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: 'not ready' });
  });
});