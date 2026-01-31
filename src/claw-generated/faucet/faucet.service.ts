import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaucetRequest } from './entities/faucet-request.entity';
import { ClawTokenService } from '../claw-token/claw-token.service';

@Injectable()
export class FaucetService {
  constructor(
    @InjectRepository(FaucetRequest)
    private faucetRequestRepository: Repository<FaucetRequest>,
    private clawTokenService: ClawTokenService,
  ) {}

  async dispenseTokens(address: string, ipAddress: string): Promise<{ message: string }> {
    // Check if address has already requested tokens today
    const existingRequest = await this.faucetRequestRepository.findOne({
      where: { address, requestedAt: new Date(new Date().toDateString()) },
    });

    if (existingRequest) {
      return { message: 'You can only request tokens once per day' };
    }

    // Mint 10 CLAW tokens for the user
    await this.clawTokenService.mint(address, 10);

    // Save the faucet request to the database
    await this.faucetRequestRepository.save({
      address,
      ipAddress,
      requestedAt: new Date(),
    });

    return { message: 'Tokens dispensed successfully' };
  }
}