import { Request, Response } from 'express';
import { TransactionSignature } from '@solana/web3.js';
import { getTransactionHistory } from './transaction_history';

export async function getSignaturesForAddress(req: Request, res: Response) {
  const { address, limit = 20, offset = 0 } = req.query;

  if (typeof address !== 'string') {
    return res.status(400).json({ error: 'Invalid address' });
  }

  const signatures: TransactionSignature[] = await getTransactionHistory(address, Number(limit), Number(offset));

  res.json({ signatures });
}