import { Request, Response } from 'express';
import { Wallet } from '../wallet';
import { createHash } from 'crypto';

export class Faucet {
  private ipLimits: Map<string, number> = new Map();
  private addressLimits: Map<string, number> = new Map();
  private cooldownPeriod = 60 * 60 * 1000; // 1 hour
  private targetValue = '00000';

  async handleRequest(req: Request, res: Response) {
    const ip = req.ip;
    const address = req.body.address;
    const nonce = req.body.nonce;

    // Check IP rate limit
    const ipCount = this.ipLimits.get(ip) || 0;
    if (ipCount >= 5) {
      return res.status(429).json({ error: 'Too many requests from your IP' });
    }
    this.ipLimits.set(ip, ipCount + 1);

    // Check address rate limit
    const addressCount = this.addressLimits.get(address) || 0;
    if (addressCount >= 3) {
      return res.status(429).json({ error: 'Too many requests from this address' });
    }
    this.addressLimits.set(address, addressCount + 1);

    // Perform proof-of-work challenge
    const solution = await this.solveProofOfWork(address, nonce);
    if (!solution) {
      return res.status(400).json({ error: 'Failed proof-of-work challenge' });
    }

    // Grant faucet tokens
    const wallet = new Wallet();
    await wallet.fundAddress(address, 10);
    return res.json({ success: true, tokens: 10 });
  }

  private async solveProofOfWork(address: string, nonce: number): Promise<boolean> {
    const data = `${address}:${nonce}`;
    const hash = createHash('sha256').update(data).digest('hex');
    return hash.startsWith(this.targetValue);
  }
}