import { Injectable } from '@nestjs/common';
import { FaucetRequestDto } from './dto/faucet-request.dto';
import { Request } from 'express';
import { ClawTokenService } from '../claw-token/claw-token.service';
import { FaucetRepository } from './faucet.repository';
import { RateLimiter } from './rate-limiter';

@Injectable()
export class FaucetService {
  private rateLimiter: RateLimiter;

  constructor(
    private clawTokenService: ClawTokenService,
    private faucetRepository: FaucetRepository
  ) {
    this.rateLimiter = new RateLimiter();
  }

  async dispenseTokens(req: Request, faucetRequest: FaucetRequestDto) {
    const { address } = faucetRequest;

    // Check if address has already received tokens today
    const lastDispensed = await this.faucetRepository.getLastDispensedForAddress(address);
    if (lastDispensed && this.isWithinOneDay(lastDispensed)) {
      return { message: 'You can only receive tokens once per day' };
    }

    // Check if the request is within the rate limit
    if (await this.rateLimiter.isWithinLimit(req.ip, address)) {
      // Mint and transfer tokens
      const amount = 10;
      await this.clawTokenService.mint(address, amount);

      // Record the transaction
      await this.faucetRepository.recordDispense(address, amount);

      return { message: `Sent ${amount} CLAW tokens to ${address}` };
    } else {
      return { message: 'Too many requests. Please try again later.' };
    }
  }

  private isWithinOneDay(lastDispensed: Date): boolean {
    const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
    const diffDays = Math.round(Math.abs((lastDispensed.getTime() - new Date().getTime()) / (oneDay)));
    return diffDays < 1;
  }
}