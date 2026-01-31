import { Module } from '@nestjs/common';
import { FaucetController } from './faucet.controller';
import { FaucetService } from './faucet.service';
import { FaucetRepository } from './faucet.repository';

@Module({
  controllers: [FaucetController],
  providers: [FaucetService, FaucetRepository],
})
export class FaucetModule {}