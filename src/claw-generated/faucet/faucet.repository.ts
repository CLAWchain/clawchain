import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaucetDispense } from './faucet.entity';

@Injectable()
export class FaucetRepository {
  constructor(
    @InjectRepository(FaucetDispense)
    private faucetDispenseRepository: Repository<FaucetDispense>
  ) {}

  async hasReceivedToday(address: string): Promise<boolean> {
    const lastDispense = await this.faucetDispenseRepository.findOne({
      where: { address },
      order: { createdAt: 'DESC' },
    });

    if (!lastDispense) {
      return false;
    }

    const today = new Date();
    const lastDispenseDate = new Date(lastDispense.createdAt);
    return (
      lastDispenseDate.getDate() === today.getDate() &&
      lastDispenseDate.getMonth() === today.getMonth() &&
      lastDispenseDate.getFullYear() === today.getFullYear()
    );
  }

  async recordDispense(address: string, ip: string): Promise<void> {
    const dispense = this.faucetDispenseRepository.create({ address, ip });
    await this.faucetDispenseRepository.save(dispense);
  }
}