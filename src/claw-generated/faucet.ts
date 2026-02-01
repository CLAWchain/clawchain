import { Request, Response } from 'express';
import { getBalance, sendTransaction } from '@clawchain/core';
import { createProofOfWork } from './proof-of-work';

const FAUCET_AMOUNT = 10000;
const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000; // 24 hours
const POW_DIFFICULTY = 4;

const ipRequestCounts: { [key: string]: number } = {};
const addressRequestCounts: { [key: string]: number } = {};

export async function faucetHandler(req: Request, res: Response) {
  const { address, nonce } = req.body;
  const ip = req.ip;

  // Check IP rate limit
  if (ipRequestCounts[ip] && ipRequestCounts[ip] >= 5) {
    return res.status(429).json({ error: 'Too many requests from this IP address' });
  }

  // Check address rate limit
  if (addressRequestCounts[address] && addressRequestCounts[address] >= 3) {
    return res.status(429).json({ error: 'Too many requests from this address' });
  }

  // Verify proof-of-work
  if (!await createProofOfWork(address, nonce, POW_DIFFICULTY)) {
    return res.status(400).json({ error: 'Invalid proof-of-work' });
  }

  // Check balance
  const balance = await getBalance(address);
  if (balance >= FAUCET_AMOUNT) {
    return res.status(400).json({ error: 'Address already has sufficient funds' });
  }

  // Send transaction
  await sendTransaction(address, FAUCET_AMOUNT);

  // Update request counts
  ipRequestCounts[ip] = (ipRequestCounts[ip] || 0) + 1;
  addressRequestCounts[address] = (addressRequestCounts[address] || 0) + 1;

  return res.json({ success: true, amount: FAUCET_AMOUNT });
}