import { Module } from '@nestjs/common';
import { FaucetModule } from './faucet/faucet.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [FaucetModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}