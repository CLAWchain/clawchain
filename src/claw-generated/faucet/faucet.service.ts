import { Injectable } from '@nestjs/common';
import { FaucetRepository } from './faucet.repository';

@Injectable()
export class FaucetService {
  constructor(private faucetRepository: FaucetRepository) {}

  async dispenseTokens(ipAddress: string, address: string): Promise<{ tokens: number }> {
    // Check rate limit
    const lastDispense = await this.faucetRepository.getLastDispenseByAddress(address);
    const now = new Date();
    if (lastDispense && lastDispense.getTime() + 24 * 60 * 60 * 1000 > now.getTime()) {
      throw new Error('Rate limit exceeded');
    }

    // Mint tokens
    await this.faucetRepository.recordDispense(address, ipAddress);
    return { tokens: 10 };
  }
}