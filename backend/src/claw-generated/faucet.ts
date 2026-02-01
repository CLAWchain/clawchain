import { Request, Response } from 'express';
import { db } from '../database/db';
import { Chain } from '../blockchain/Chain';

export const faucetRoute = async (req: Request, res: Response) => {
  const { address } = req.body;

  // Check if address has already requested tokens today
  const existingRequest = await db.faucetRequests.findOne({ where: { address, requestedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } });
  if (existingRequest) {
    return res.status(429).json({ error: 'You can only request tokens once per day' });
  }

  // Mint 10 CLAW tokens and send to the address
  await Chain.mintTokens(address, 10);

  // Record the request in the database
  await db.faucetRequests.create({ address, requestedAt: new Date() });

  return res.json({ message: 'Tokens sent successfully' });
};