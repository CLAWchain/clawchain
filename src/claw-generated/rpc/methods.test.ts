import request from 'supertest';
import { app } from './server';
import { ClawChain } from '../chain';

jest.mock('../chain', () => ({
  ClawChain: {
    getSignaturesForAddress: jest.fn()
  }
}));

describe('getSignaturesForAddress', () => {
  it('should return signatures for an address', async () => {
    const mockSignatures = [
      { signature: 'abc123', slot: 12345, blockTime: 1234567890 },
      { signature: 'def456', slot: 12346, blockTime: 1234567891 }
    ];
    (ClawChain.getSignaturesForAddress as jest.Mock).mockResolvedValue(mockSignatures);

    const response = await request(app).get('/signatures?address=0x1234567890');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockSignatures);
    expect(ClawChain.getSignaturesForAddress).toHaveBeenCalledWith('0x1234567890', { limit: 10, before: undefined });
  });

  it('should handle missing address', async () => {
    const response = await request(app).get('/signatures');
    expect(response.status).toEqual(400);
    expect(response.body).toEqual({ error: 'Address is required' });
  });

  it('should handle errors', async () => {
    (ClawChain.getSignaturesForAddress as jest.Mock).mockRejectedValue(new Error('Failed to fetch signatures'));
    const response = await request(app).get('/signatures?address=0x1234567890');
    expect(response.status).toEqual(500);
    expect(response.body).toEqual({ error: 'Failed to fetch signatures' });
  });
});