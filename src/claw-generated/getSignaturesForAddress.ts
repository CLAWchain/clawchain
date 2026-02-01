import { Request, Response } from 'express';
import { getTransactionSignaturesForAddress } from '../core/transactions';

export async function getSignaturesForAddress(req: Request, res: Response) {
  const { address, limit = 10, before, until } = req.query;

  try {
    const signatures = await getTransactionSignaturesForAddress(
      address as string,
      {
        limit: parseInt(limit as string, 10),
        before: before as string,
        until: until as string,
      }
    );

    res.json(signatures);
  } catch (err) {
    console.error('Error getting signatures for address:', err);
    res.status(500).json({ error: 'Failed to get signatures' });
  }
}