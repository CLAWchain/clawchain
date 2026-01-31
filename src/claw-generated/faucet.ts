import { Request, Response } from 'express';
import { mintTokens } from '../token-service';
import { recordFaucetRequest } from '../faucet-db';

export const faucetRoute = async (req: Request, res: Response) => {
  const { address } = req.body;

  // Check if address has received a faucet payout in the last 24 hours
  const hasRecentPayout = await hasRecentFaucetPayout(address);
  if (hasRecentPayout) {
    return res.status(429).json({ error: 'You can only request faucet once per day' });
  }

  // Mint 10 CLAW tokens and send to the address
  await mintTokens(address, 10);

  // Record the faucet request in the database
  await recordFaucetRequest(address);

  return res.json({ message: 'Faucet payout successful' });
};

async function hasRecentFaucetPayout(address: string): Promise<boolean> {
  // TODO: Implement database lookup to check for recent faucet payouts
  return false;
}