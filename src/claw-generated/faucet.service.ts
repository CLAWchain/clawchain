import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaucetRequest } from './faucet.entity';
import { CLAW } from '../token/claw.entity';

@Injectable()
export class FaucetService {
  constructor(
    @InjectRepository(FaucetRequest)
    private faucetRequestRepository: Repository<FaucetRequest>,
    @InjectRepository(CLAW)
    private clawRepository: Repository<CLAW>
  ) {}

  async dispenseTokens(address: string, ip: string): Promise<{ success: boolean; message?: string }> {
    // Check if address has already received tokens today
    const today = new Date().toISOString().slice(0, 10);
    const existingRequest = await this.faucetRequestRepository.findOne({
      where: { address, requestDate: today },
    });

    if (existingRequest) {
      return { success: false, message: 'You can only claim faucet tokens once per day' };
    }

    // Mint 10 CLAW tokens
    const tokens = await this.clawRepository.save(
      this.clawRepository.create({ amount: 10, recipient: address })
    );

    // Record the faucet request
    await this.faucetRequestRepository.save(
      this.faucetRequestRepository.create({ address, ip, requestDate: today })
    );

    return { success: true };
  }
}