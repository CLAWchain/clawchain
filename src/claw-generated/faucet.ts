import { Request, Response } from 'express';
import { getTokenBalance, mintTokens } from './blockchain';
import { addFaucetRequest, checkFaucetRequest } from './db';

export const faucetEndpoint = async (req: Request, res: Response) => {
  const { address } = req.body;

  // Check if address has already received tokens in the last 24 hours
  const hasRequestedRecently = await checkFaucetRequest(address);
  if (hasRequestedRecently) {
    return res.status(429).json({ error: 'You can only request from the faucet once per day' });
  }

  // Mint 10 CLAW tokens and send to the address
  await mintTokens(address, 10);

  // Record the faucet request
  await addFaucetRequest(address);

  return res.json({ message: 'Tokens sent to your address' });
};