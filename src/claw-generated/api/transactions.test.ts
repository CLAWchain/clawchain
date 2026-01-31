import { validateTransaction } from './transactions';
import { Request, Response } from 'express';

describe('validateTransaction', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {
        from: '0x1234567890abcdef1234567890abcdef12345678',
        to: '0x0987654321fedcba0987654321fedcba09876543',
        amount: 100
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should validate a valid transaction', () => {
    validateTransaction(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Transaction validated' });
  });

  it('should return an error for an invalid `from` address', () => {
    req.body.from = 'invalid';
    validateTransaction(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid `from` address' });
  });

  it('should return an error for an invalid `to` address', () => {
    req.body.to = 'invalid';
    validateTransaction(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid `to` address' });
  });

  it('should return an error for an invalid `amount`', () => {
    req.body.amount = -10;
    validateTransaction(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid `amount`' });
  });
});