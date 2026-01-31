import { Request } from 'express';
import { keccak256 } from 'js-sha3';

export class RateLimiter {
  private ipRequestCounts: Map<string, number> = new Map();
  private addressRequestCounts: Map<string, number> = new Map();
  private readonly maxRequestsPerPeriod = 5;
  private readonly cooldownPeriod = 60 * 1000; // 1 minute

  isRateLimited(ipAddress: string, address: string): boolean {
    const ipRequestCount = this.ipRequestCounts.get(ipAddress) || 0;
    const addressRequestCount = this.addressRequestCounts.get(address) || 0;

    return ipRequestCount >= this.maxRequestsPerPeriod || addressRequestCount >= this.maxRequestsPerPeriod;
  }

  recordRequest(ipAddress: string, address: string): void {
    this.ipRequestCounts.set(ipAddress, (this.ipRequestCounts.get(ipAddress) || 0) + 1);
    this.addressRequestCounts.set(address, (this.addressRequestCounts.get(address) || 0) + 1);

    setTimeout(() => {
      this.ipRequestCounts.set(ipAddress, (this.ipRequestCounts.get(ipAddress) || 0) - 1);
      this.addressRequestCounts.set(address, (this.addressRequestCounts.get(address) || 0) - 1);
    }, this.cooldownPeriod);
  }

  async verifyProofOfWork(req: Request): Promise<boolean> {
    const { nonce } = req.body;
    const ipAddress = req.ip;
    const challenge = `${ipAddress}:${Date.now()}`;
    const hash = keccak256(challenge + nonce);

    // Verify that the hash starts with 0000 (difficulty 4)
    return hash.startsWith('0000');
  }
}