import { config } from '../config';

const requestCache: Map<string, number> = new Map();

export async function rateLimit(ip: string, address: string): Promise<boolean> {
  const key = `${ip}:${address}`;
  const lastRequest = requestCache.get(key) || 0;
  const now = Date.now();

  if (now - lastRequest < config.faucet.cooldownPeriod) {
    return true;
  }

  const requestCount = (requestCache.get(key) || 0) + 1;
  if (requestCount > config.faucet.maxRequestsPerPeriod) {
    return true;
  }

  requestCache.set(key, now);
  return false;
}