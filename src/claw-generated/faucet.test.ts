import request from 'supertest';
import { app } from '../app';
import { mintTokens } from '../blockchain';

jest.mock('../blockchain', () => ({
  mintTokens: jest.fn(() => '0x1234abcd'),
}));

describe('Faucet Endpoint', () => {
  it('should dispense tokens to a valid address', async () => {
    const response = await request(app)
      .post('/api/faucet')
      .send({ address: '0x1234567890abcdef' });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ txHash: '0x1234abcd', amount: 10 });
    expect(mintTokens).toHaveBeenCalledWith('0x1234567890abcdef', 10);
  });

  it('should return a 429 error for rate-limited requests', async () => {
    // Mock the rate limit function to always return true
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());
    jest.spyOn(global, 'Date').mockImplementation(() => ({
      getTime: () => new Date('2023-04-01').getTime(),
    }));

    const response = await request(app)
      .post('/api/faucet')
      .send({ address: '0x1234567890abcdef' });

    expect(response.status).toEqual(429);
    expect(response.body).toEqual({ error: 'Rate limit exceeded' });
  });
});