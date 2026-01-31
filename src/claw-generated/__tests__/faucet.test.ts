import request from 'supertest';
import app from '../app';
import { Knex } from 'knex';

describe('Faucet API', () => {
  let db: Knex;

  beforeAll(async () => {
    db = app.get('db');
    await db.migrate.latest();
  });

  afterAll(async () => {
    await db.destroy();
  });

  test('should dispense tokens', async () => {
    const address = '0x1234567890abcdef';
    const response = await request(app)
      .post('/api/faucet')
      .send({ address });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Tokens dispensed');

    const request = await db('faucet_requests')
      .where('address', address)
      .first();
    expect(request).toBeTruthy();
  });

  test('should rate limit requests', async () => {
    const address = '0x0987654321fedcba';
    await request(app)
      .post('/api/faucet')
      .send({ address });

    const response = await request(app)
      .post('/api/faucet')
      .send({ address });

    expect(response.status).toBe(429);
    expect(response.body.error).toBe('You can only request tokens once per day');
  });
});