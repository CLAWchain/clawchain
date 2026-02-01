import { Request, Response } from 'express';
import { Wallet } from '../wallet/wallet';

export class Faucet {
  private walletMap: Map<string, { lastRequest: number, requestCount: number }> = new Map();
  private ipMap: Map<string, { lastRequest: number, requestCount: number }> = new Map();
  private cooldownPeriod = 60 * 60 * 1000; // 1 hour
  private maxRequestsPerHour = 5;

  async handleRequest(req: Request, res: Response) {
    const { address } = req.body;
    const ip = req.ip;

    // Check if address is valid
    if (!Wallet.isValidAddress(address)) {
      res.status(400).json({ error: 'Invalid wallet address' });
      return;
    }

    // Check rate limit by address
    const addressData = this.walletMap.get(address);
    if (addressData && addressData.lastRequest + this.cooldownPeriod > Date.now()) {
      res.status(429).json({ error: 'Too many requests, please try again later' });
      return;
    }
    if (addressData && addressData.requestCount >= this.maxRequestsPerHour) {
      res.status(429).json({ error: 'You have reached the hourly request limit' });
      return;
    }

    // Check rate limit by IP
    const ipData = this.ipMap.get(ip);
    if (ipData && ipData.lastRequest + this.cooldownPeriod > Date.now()) {
      res.status(429).json({ error: 'Too many requests from this IP, please try again later' });
      return;
    }
    if (ipData && ipData.requestCount >= this.maxRequestsPerHour) {
      res.status(429).json({ error: 'This IP has reached the hourly request limit' });
      return;
    }

    // TODO: Implement proof-of-work or captcha challenge

    // Send funds to the wallet
    await Wallet.sendFunds(address, 1000);

    // Update rate limit tracking
    this.updateRateLimitTracking(address, ip);

    res.status(200).json({ message: 'Funds sent to your wallet' });
  }

  private updateRateLimitTracking(address: string, ip: string) {
    const now = Date.now();

    // Update address tracking
    let addressData = this.walletMap.get(address);
    if (!addressData) {
      addressData = { lastRequest: now, requestCount: 1 };
    } else {
      addressData.lastRequest = now;
      addressData.requestCount++;
    }
    this.walletMap.set(address, addressData);

    // Update IP tracking
    let ipData = this.ipMap.get(ip);
    if (!ipData) {
      ipData = { lastRequest: now, requestCount: 1 };
    } else {
      ipData.lastRequest = now;
      ipData.requestCount++;
    }
    this.ipMap.set(ip, ipData);
  }
}