import { Request, Response } from 'express';
import { db } from '../database/db';
import { StateManager } from '../blockchain/StateManager';

export async function faucetHandler(req: Request, res: Response) {
  const { address } = req.body;

  // Check if the address has already received a faucet payout in the last 24 hours
  const lastPayout = await db.faucet.findOne({ where: { address, createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } });
  if (lastPayout) {
    return res.status(429).json({ error: 'You can only request from the faucet once per day.' });
  }

  // Mint 10 CLAW tokens and send them to the requesting address
  await StateManager.mintTokens(address, 10);

  // Store the faucet payout in the database
  await db.faucet.create({ address, amount: 10 });

  return res.json({ message: 'Faucet payout successful!' });
}