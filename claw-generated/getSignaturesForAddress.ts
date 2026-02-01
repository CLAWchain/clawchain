import { Request, Response } from 'express';
import { getTransactionSignatures } from './transactionService';

export async function getSignaturesForAddress(req: Request, res: Response) {
  const { address, limit = 10, before, until } = req.query;

  try {
    const signatures = await getTransactionSignatures(
      address as string,
      typeof limit === 'string' ? parseInt(limit) : 10,
      before as string,
      until as string
    );
    res.json(signatures);
  } catch (err) {
    console.error('Error in getSignaturesForAddress:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}