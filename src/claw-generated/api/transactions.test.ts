import request from 'supertest';
import app from './server';

describe('Transactions API', () => {
  describe('POST /transactions', () => {
    it('should validate a valid transaction', async () => {
      const response = await request(app)
        .post('/transactions')
        .send({
          from: '0x1234567890123456789012345678901234567890',
          to: '0x0987654321098765432109876543210987654321',
          amount: 100,
        });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ message: 'Transaction validated' });
    });

    it('should return an error for an invalid `from` address', async () => {
      const response = await request(app)
        .post('/transactions')
        .send({
          from: 'invalid-address',
          to: '0x0987654321098765432109876543210987654321',
          amount: 100,
        });

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({ error: 'Invalid `from` address' });
    });

    it('should return an error for an invalid `to` address', async () => {
      const response = await request(app)
        .post('/transactions')
        .send({
          from: '0x1234567890123456789012345678901234567890',
          to: 'invalid-address',
          amount: 100,
        });

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({ error: 'Invalid `to` address' });
    });

    it('should return an error for an invalid `amount`', async () => {
      const response = await request(app)
        .post('/transactions')
        .send({
          from: '0x1234567890123456789012345678901234567890',
          to: '0x0987654321098765432109876543210987654321',
          amount: -100,
        });

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({ error: 'Invalid `amount`' });
    });
  });
});