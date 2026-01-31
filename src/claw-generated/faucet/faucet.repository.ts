import { Injectable } from '@nestjs/common';

@Injectable()
export class FaucetRepository {
  private dispensedAddresses: Map<string, Date> = new Map();

  async getLastDispenseByAddress(address: string): Promise<Date | null> {
    return this.dispensedAddresses.get(address) || null;
  }

  async recordDispense(address: string, ipAddress: string): Promise<void> {
    this.dispensedAddresses.set(address, new Date());
  }
}