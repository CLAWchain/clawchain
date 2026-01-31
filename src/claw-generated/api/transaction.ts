import { Request, Response } from 'express';
import { TransactionService } from '../TransactionService';

export const getTransaction = async (req: Request, res: Response) => {
  const { hash } = req.params;

  try {
    const transaction = await TransactionService.getTransaction(hash);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Error fetching transaction' });
  }
};