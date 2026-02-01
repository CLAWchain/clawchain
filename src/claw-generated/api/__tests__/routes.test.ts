import request from 'supertest';
import { routes } from '../routes';

describe('API routes', () => {
  describe('/health', () => {
    it('should return node health status', async () => {
      const response = await request(routes).get('/health');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ healthy: true });
    });
  });

  describe('/ready', () => {
    it('should return node readiness status', async () => {
      const response = await request(routes).get('/ready');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ ready: true });
    });
  });
});