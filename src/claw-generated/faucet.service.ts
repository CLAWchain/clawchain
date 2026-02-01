import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionService } from '../transaction/transaction.service';
import { WalletService } from '../wallet/wallet.service';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { CaptchaService } from './captcha.service';

@Injectable()
export class FaucetService {
  private rateLimiter: RateLimiterMemory;

  constructor(
    private configService: ConfigService,
    private transactionService: TransactionService,
    private walletService: WalletService,
    private captchaService: CaptchaService
  ) {
    this.rateLimiter = new RateLimiterMemory({
      points: this.configService.get<number>('FAUCET_RATE_LIMIT_PER_IP'),
      duration: this.configService.get<number>('FAUCET_RATE_LIMIT_DURATION_SECONDS'),
      blockDuration: this.configService.get<number>('FAUCET_RATE_LIMIT_BLOCK_DURATION_SECONDS'),
    });
  }

  async dispenseTokens(ipAddress: string, walletAddress: string, captchaResponse: string): Promise<void> {
    await this.rateLimiter.consume(`${ipAddress}:${walletAddress}`);
    await this.captchaService.verifyResponse(captchaResponse);

    const amount = this.configService.get<number>('FAUCET_AMOUNT');
    const transaction = await this.transactionService.createTransaction(
      this.configService.get<string>('FAUCET_WALLET'),
      walletAddress,
      amount
    );
    await this.transactionService.signAndBroadcast(transaction);
  }
}