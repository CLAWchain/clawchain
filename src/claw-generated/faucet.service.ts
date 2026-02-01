import { Injectable } from '@nestjs/common';
import { FaucetRequestDto } from './dto/faucet-request.dto';
import { Request } from 'express';
import { ClawTokenService } from '../claw-token/claw-token.service';
import { FaucetRepository } from './faucet.repository';

@Injectable()
export class FaucetService {
  constructor(
    private clawTokenService: ClawTokenService,
    private faucetRepository: FaucetRepository
  ) {}

  async dispenseTokens(req: Request, faucetRequest: FaucetRequestDto) {
    const { address } = faucetRequest;

    // Check if address has already received tokens today
    const lastDispensed = await this.faucetRepository.getLastDispensedForAddress(address);
    if (lastDispensed && this.isWithinOneDay(lastDispensed)) {
      return { message: 'You can only receive tokens once per day' };
    }

    // Mint and transfer tokens
    const amount = 10;
    await this.clawTokenService.mint(address, amount);

    // Record the transaction
    await this.faucetRepository.recordDispense(address, amount);

    return { message: `Sent ${amount} CLAW tokens to ${address}` };
  }

  private isWithinOneDay(lastDispensed: Date): boolean {
    const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
    const diffDays = Math.round(Math.abs((lastDispensed.getTime() - new Date().getTime()) / (oneDay)));
    return diffDays < 1;
  }
}