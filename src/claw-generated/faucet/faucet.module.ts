import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaucetController } from './faucet.controller';
import { FaucetService } from './faucet.service';
import { FaucetClaimEntity } from './faucet-claim.entity';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FaucetClaimEntity]),
    TokenModule
  ],
  controllers: [FaucetController],
  providers: [FaucetService]
})
export class FaucetModule {}