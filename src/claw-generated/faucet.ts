import { NextFunction, Request, Response } from 'express';
import { CLAW } from '../economics/token';

const claimedAddresses = new Map<string, Date>();
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 1 day

export const faucetEndpoint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.body;

    // Check if address has already claimed tokens within the rate limit window
    const lastClaimed = claimedAddresses.get(address);
    if (lastClaimed && new Date().getTime() - lastClaimed.getTime() < RATE_LIMIT_WINDOW) {
      return res.status(429).json({ error: 'You can only claim tokens once per day' });
    }

    // Mint 10 CLAW tokens and send to the requesting address
    await CLAW.mint(address, 10);

    // Track the claimed address and timestamp
    claimedAddresses.set(address, new Date());

    res.status(200).json({ message: 'Tokens minted and sent to your address' });
  } catch (error) {
    console.error('Error in faucet endpoint:', error);
    res.status(500).json({ error: 'Failed to mint tokens' });
  }
};