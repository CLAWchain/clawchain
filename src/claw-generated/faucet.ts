import { NextFunction, Request, Response } from 'express';
import { mintTokens } from '../services/tokenService';
import { recordFaucetRequest } from '../services/faucetService';

export const faucetHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.body;

    // Check if address has already received tokens in the last 24 hours
    const hasReceivedTokens = await recordFaucetRequest(address);
    if (hasReceivedTokens) {
      return res.status(429).json({ error: 'You can only request tokens once per day' });
    }

    // Mint 10 CLAW tokens and send to the address
    await mintTokens(address, 10);

    return res.status(200).json({ message: 'Tokens dispensed successfully' });
  } catch (error) {
    next(error);
  }
};