import { faucetEndpoint } from '../faucet';
import { Request, Response } from 'express';

describe('Faucet Endpoint', () => {
  it('should dispense tokens to a new address', async () => {
    const mockReq = { body: { address: '0x1234567890abcdef' }} as Request;
    const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

    await faucetEndpoint(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Tokens dispensed successfully' });
  });

  it('should rate limit requests from the same address', async () => {
    const mockReq = { body: { address: '0x1234567890abcdef' }} as Request;
    const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

    // First request should succeed
    await faucetEndpoint(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);

    // Second request should be rate limited
    await faucetEndpoint(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(429);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'You can only claim once per day' });
  });
});