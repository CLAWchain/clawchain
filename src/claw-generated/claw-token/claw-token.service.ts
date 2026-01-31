import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClawToken } from './entities/claw-token.entity';

@Injectable()
export class ClawTokenService {
  constructor(
    @InjectRepository(ClawToken)
    private clawTokenRepository: Repository<ClawToken>,
  ) {}

  async mint(address: string, amount: number): Promise<void> {
    const token = await this.clawTokenRepository.findOne({ where: { address } });
    if (token) {
      token.balance += amount;
      await this.clawTokenRepository.save(token);
    } else {
      await this.clawTokenRepository.save({ address, balance: amount });
    }
  }
}