export class RateLimiter {
  private ipLimits: Map<string, number> = new Map();
  private addressLimits: Map<string, number> = new Map();
  private cooldownPeriod: number = 60000; // 1 minute

  canRequest(address: string, ip: string): boolean {
    // Check IP limit
    const ipLimit = this.ipLimits.get(ip) || 0;
    if (ipLimit >= 10) {
      return false;
    }

    // Check address limit
    const addressLimit = this.addressLimits.get(address) || 0;
    if (addressLimit >= 5) {
      return false;
    }

    return true;
  }

  recordRequest(address: string, ip: string): void {
    // Update IP limit
    const ipLimit = this.ipLimits.get(ip) || 0;
    this.ipLimits.set(ip, ipLimit + 1);

    // Update address limit
    const addressLimit = this.addressLimits.get(address) || 0;
    this.addressLimits.set(address, addressLimit + 1);

    // Remove limits after cooldown period
    setTimeout(() => {
      this.ipLimits.delete(ip);
      this.addressLimits.delete(address);
    }, this.cooldownPeriod);
  }
}