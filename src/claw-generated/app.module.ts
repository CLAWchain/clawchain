import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaucetModule } from './faucet/faucet.module';
import { TokenModule } from './token/token.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    FaucetModule,
    TokenModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}