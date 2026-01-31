import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaucetController } from './faucet.controller';
import { FaucetService } from './faucet.service';
import { FaucetRepository } from './faucet.repository';
import { FaucetDispense } from './faucet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FaucetDispense])],
  controllers: [FaucetController],
  providers: [FaucetService, FaucetRepository],
})
export class FaucetModule {}