import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaucetClaimEntity } from './faucet-claim.entity';
import { TokenService } from '../token/token.service';

@Injectable()
export class FaucetService {
  constructor(
    @InjectRepository(FaucetClaimEntity)
    private faucetClaimRepository: Repository<FaucetClaimEntity>,
    private tokenService: TokenService
  ) {}

  async claimTokens(address: string, ip: string): Promise<{ success: boolean; message?: string }> {
    const lastClaim = await this.faucetClaimRepository.findOne({ where: { address } });
    const now = new Date();

    if (lastClaim && lastClaim.claimedAt.getDate() === now.getDate()) {
      return { success: false, message: 'You can only claim once per day' };
    }

    await this.tokenService.mint(address, 10);

    const claim = this.faucetClaimRepository.create({
      address,
      ip,
      claimedAt: now
    });
    await this.faucetClaimRepository.save(claim);

    return { success: true };
  }
}