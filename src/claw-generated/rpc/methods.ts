import { Request, Response } from 'express';
import { ClawChain } from '../chain';

export const getSignaturesForAddress = async (req: Request, res: Response) => {
  const { address, limit = 10, before } = req.query;
  
  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  try {
    const signatures = await ClawChain.getSignaturesForAddress(address as string, {
      limit: typeof limit === 'string' ? parseInt(limit) : 10,
      before: before as string | undefined
    });
    res.json(signatures);
  } catch (err) {
    console.error('Error getting signatures:', err);
    res.status(500).json({ error: 'Failed to fetch signatures' });
  }
};