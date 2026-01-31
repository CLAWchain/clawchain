import { NextApiRequest, NextApiResponse } from 'next';
import { mint, getRemainingTokens } from '../services/token';
import { recordDispensed, checkAddressLimit } from '../services/faucet';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { address } = req.body;

    // Check if address has hit the daily limit
    const hasHitLimit = await checkAddressLimit(address);
    if (hasHitLimit) {
      return res.status(429).json({ error: 'Address has hit the daily limit' });
    }

    // Mint 10 CLAW tokens for the address
    await mint(address, 10);

    // Record the dispensed address
    await recordDispensed(address);

    // Return the remaining token supply
    const remainingTokens = await getRemainingTokens();
    return res.status(200).json({ remainingTokens });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}