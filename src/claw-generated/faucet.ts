import { Request, Response } from 'express';
import { getWallet, mintTokens } from '../blockchain';
import { FaucetRequest, FaucetResponse } from '../types';
import { rateLimit, trackDispense } from '../faucet';

export async function faucetEndpoint(req: Request, res: Response) {
  const { address } = req.body as FaucetRequest;

  // Check rate limit
  if (await rateLimit(address)) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  // Mint tokens
  const txHash = await mintTokens(address, 10);

  // Track dispensed address
  await trackDispense(address);

  // Return success response
  const response: FaucetResponse = { txHash, amount: 10 };
  return res.status(200).json(response);
}

// Rate limit to 1 request per address per day
export async function rateLimit(address: string): Promise<boolean> {
  // Check if address has been dispensed to in the last 24 hours
  const lastDispense = await getLastDispense(address);
  const now = new Date().getTime();
  const dayInMs = 24 * 60 * 60 * 1000;
  return lastDispense > 0 && now - lastDispense < dayInMs;
}

// Track addresses that have received tokens
export async function trackDispense(address: string): Promise<void> {
  // Store timestamp of last dispense to this address
  await storeLastDispense(address, new Date().getTime());
}

// Stub implementations for now
async function getLastDispense(address: string): Promise<number> {
  return 0;
}

async function storeLastDispense(address: string, timestamp: number): Promise<void> {
  // TODO: Implement database storage
}