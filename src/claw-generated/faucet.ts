import { Request, Response } from 'express';
import { Wallet } from '../wallet/wallet';
import { RateLimiter } from './rate-limiter';

export class Faucet {
  private wallets: Wallet[];
  private rateLimiter: RateLimiter;

  constructor(wallets: Wallet[]) {
    this.wallets = wallets;
    this.rateLimiter = new RateLimiter();
  }

  async handleRequest(req: Request, res: Response) {
    const { address } = req.body;

    // Check if the request is within the rate limit
    if (await this.rateLimiter.isWithinLimit(req.ip, address)) {
      // Perform faucet request logic
      const wallet = this.wallets[Math.floor(Math.random() * this.wallets.length)];
      const txHash = await wallet.sendToAddress(address, 1);
      res.status(200).send(`Faucet request successful. Transaction hash: ${txHash}`);
    } else {
      res.status(429).send('Too many requests. Please try again later.');
    }
  }
}