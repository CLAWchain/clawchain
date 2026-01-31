import { Request, Response } from 'express';
import { getAccountBalance } from '../state';

export const rpcRouter = (req: Request, res: Response) => {
  const { method, params } = req.body;
  switch (method) {
    case 'getBalance':
      handleGetBalance(req, res);
      break;
    default:
      res.status(404).json({ error: 'Method not found' });
  }
};

const handleGetBalance = async (req: Request, res: Response) => {
  const { pubkey } = req.body.params;
  const balance = await getAccountBalance(pubkey);
  res.json({ balance });
};