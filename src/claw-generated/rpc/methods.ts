import { Request, Response } from 'express';
import { ClawChain } from '../chain';
import { Transaction } from '../transaction/transaction';

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

export const getTransaction = async (req: Request, res: Response) => {
  const { signature } = req.query;

  if (!signature) {
    return res.status(400).json({ error: 'Signature is required' });
  }

  try {
    const transaction = await ClawChain.getTransaction(signature as string);
    if (transaction) {
      res.json(transaction);
    } else {
      res.status(404).json({ error: 'Transaction not found' });
    }
  } catch (err) {
    console.error('Error getting transaction:', err);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
};

export const ClawChain = {
  getSignaturesForAddress: async (address: string, options: { limit?: number; before?: string }) => {
    // Existing getSignaturesForAddress implementation
    return [];
  },

  getTransaction: async (signature: string): Promise<Transaction | null> => {
    // TODO: Implement getTransaction method
    return null;
  }
};