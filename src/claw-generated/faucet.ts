import { Request, Response } from 'express';
import { mintTokens } from '../services/token';
import { trackFaucetRequest } from '../services/faucet';

export const faucetEndpoint = async (req: Request, res: Response) => {
  const { address } = req.body;

  // Check if address has already received tokens today
  const hasClaimedToday = await trackFaucetRequest(address);
  if (hasClaimedToday) {
    return res.status(429).json({ error: 'You can only claim once per day' });
  }

  // Mint 10 CLAW tokens for the address
  await mintTokens(address, 10);

  // Track the faucet request
  await trackFaucetRequest(address);

  return res.json({ message: 'Tokens dispensed successfully' });
};