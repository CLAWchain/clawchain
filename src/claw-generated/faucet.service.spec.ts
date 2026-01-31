import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TransactionService } from '../transaction/transaction.service';
import { WalletService } from '../wallet/wallet.service';
import { FaucetService } from './faucet.service';
import { CaptchaService } from './captcha.service';
import { RateLimiterMemory } from 'rate-limiter-flexible';

describe('FaucetService', () => {
  let faucetService: FaucetService;
  let configService: ConfigService;
  let transactionService: TransactionService;
  let walletService: WalletService;
  let captchaService: CaptchaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FaucetService,
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: TransactionService, useValue: { createTransaction: jest.fn(), signAndBroadcast: jest.fn() } },
        { provide: WalletService, useValue: {} },
        { provide: CaptchaService, useValue: { verifyResponse: jest.fn() } },
      ],
    }).compile();

    faucetService = module.get<FaucetService>(FaucetService);
    configService = module.get<ConfigService>(ConfigService);
    transactionService = module.get<TransactionService>(TransactionService);
    walletService = module.get<WalletService>(WalletService);
    captchaService = module.get<CaptchaService>(CaptchaService);
  });

  it('should dispense tokens and verify captcha', async () => {
    const ipAddress = '192.168.1.100';
    const walletAddress = '0x1234567890abcdef';
    const captchaResponse = 'valid-captcha-response';

    jest.spyOn(configService, 'get').mockReturnValueOnce(100).mockReturnValueOnce('faucet-wallet');
    jest.spyOn(transactionService, 'createTransaction').mockResolvedValue({ tx: 'signed-tx' });
    jest.spyOn(captchaService, 'verifyResponse').mockResolvedValue();

    await faucetService.dispenseTokens(ipAddress, walletAddress, captchaResponse);

    expect(captchaService.verifyResponse).toHaveBeenCalledWith(captchaResponse);
    expect(transactionService.createTransaction).toHaveBeenCalledWith('faucet-wallet', walletAddress, 100);
    expect(transactionService.signAndBroadcast).toHaveBeenCalledWith({ tx: 'signed-tx' });
  });

  it('should rate limit requests', async () => {
    const ipAddress = '192.168.1.100';
    const walletAddress = '0x1234567890abcdef';
    const captchaResponse = 'valid-captcha-response';

    jest.spyOn(configService, 'get')
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(10)
      .mockReturnValueOnce(60)
      .mockReturnValueOnce(100)
      .mockReturnValueOnce('faucet-wallet');

    jest.spyOn(transactionService, 'createTransaction').mockResolvedValue({ tx: 'signed-tx' });
    jest.spyOn(captchaService, 'verifyResponse').mockResolvedValue();

    await faucetService.dispenseTokens(ipAddress, walletAddress, captchaResponse);
    await expect(faucetService.dispenseTokens(ipAddress, walletAddress, captchaResponse)).rejects.toThrow();
  });
});