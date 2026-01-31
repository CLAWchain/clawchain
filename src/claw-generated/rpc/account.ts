import { Request, Response } from 'express';
import { getAccount } from '../services/account';

export const getAccountInfo = async (req: Request, res: Response) => {
  try {
    const { pubkey } = req.query;
    if (!pubkey) {
      return res.status(400).json({ error: 'Missing pubkey' });
    }

    const accountInfo = await getAccount(pubkey as string);
    res.json(accountInfo);
  } catch (err) {
    console.error('Error getting account info:', err);
    res.status(500).json({ error: 'Failed to get account info' });
  }
};