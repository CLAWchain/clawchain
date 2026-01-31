import { Request, Response } from 'express';

export const validateTransaction = (req: Request, res: Response) => {
  const { from, to, amount } = req.body;

  // Validate `from` address
  if (typeof from !== 'string' || from.length !== 42 || !from.startsWith('0x')) {
    return res.status(400).json({ error: 'Invalid `from` address' });
  }

  // Validate `to` address
  if (typeof to !== 'string' || to.length !== 42 || !to.startsWith('0x')) {
    return res.status(400).json({ error: 'Invalid `to` address' });
  }

  // Validate `amount`
  if (typeof amount !== 'number' || amount <= 0 || !Number.isInteger(amount)) {
    return res.status(400).json({ error: 'Invalid `amount`' });
  }

  // If all validations pass, proceed with transaction processing
  res.status(200).json({ message: 'Transaction validated' });
};