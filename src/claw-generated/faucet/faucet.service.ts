import { Injectable } from '@nestjs/common';
import { FaucetRepository } from './faucet.repository';

@Injectable()
export class FaucetService {
  constructor(private faucetRepository: FaucetRepository) {}

  async dispenseTokens(address: string, ip: string): Promise<{ tokens: number }> {
    // Check if address has already received tokens today
    const hasReceivedToday = await this.faucetRepository.hasReceivedToday(address);
    if (hasReceivedToday) {
      return { tokens: 0 };
    }

    // Mint 10 CLAW tokens for the address
    await this.faucetRepository.recordDispense(address, ip);
    return { tokens: 10 };
  }
}