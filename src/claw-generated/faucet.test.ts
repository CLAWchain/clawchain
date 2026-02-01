import { faucetHandler } from './faucet';
import { recordFaucetRequest } from './faucetService';
import { mintTokens } from './tokenService';

jest.mock('./faucetService');
jest.mock('./tokenService');

describe('faucetHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should dispense tokens successfully', async () => {
    const req = { body: { address: '0x1234567890' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    (recordFaucetRequest as jest.Mock).mockResolvedValue(false);

    await faucetHandler(req, res, next);

    expect(recordFaucetRequest).toHaveBeenCalledWith('0x1234567890');
    expect(mintTokens).toHaveBeenCalledWith('0x1234567890', 10);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Tokens dispensed successfully' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should rate limit requests', async () => {
    const req = { body: { address: '0x1234567890' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    (recordFaucetRequest as jest.Mock).mockResolvedValue(true);

    await faucetHandler(req, res, next);

    expect(recordFaucetRequest).toHaveBeenCalledWith('0x1234567890');
    expect(mintTokens).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ error: 'You can only request tokens once per day' });
    expect(next).not.toHaveBeenCalled();
  });
});