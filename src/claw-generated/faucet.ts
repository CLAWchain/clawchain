import { Request, Response } from 'express';
import { Wallet } from '../wallet/wallet';
import { BlockchainNode } from '../node/node';
import { RateLimiter } from './rate-limiter';

export class Faucet {
  private wallet: Wallet;
  private node: BlockchainNode;
  private rateLimiter: RateLimiter;

  constructor(wallet: Wallet, node: BlockchainNode) {
    this.wallet = wallet;
    this.node = node;
    this.rateLimiter = new RateLimiter();
  }

  handleFaucetRequest = async (req: Request, res: Response) => {
    const { address } = req.body;
    const ipAddress = req.ip;

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    // Check rate limiting
    if (this.rateLimiter.isRateLimited(ipAddress, address)) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    // Perform proof-of-work challenge
    if (!await this.rateLimiter.verifyProofOfWork(req)) {
      return res.status(403).json({ error: 'Proof-of-work challenge failed' });
    }

    try {
      const tx = await this.wallet.sendFromFaucet(address);
      this.rateLimiter.recordRequest(ipAddress, address);
      res.json({ txHash: tx.hash });
    } catch (err) {
      console.error('Error processing faucet request:', err);
      res.status(500).json({ error: 'Failed to process faucet request' });
    }
  };
}