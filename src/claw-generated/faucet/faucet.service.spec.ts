import { Test, TestingModule } from '@nestjs/testing';
import { FaucetService } from './faucet.service';
import { FaucetRepository } from './faucet.repository';

describe('FaucetService', () => {
  let service: FaucetService;
  let repository: FaucetRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FaucetService, FaucetRepository],
    }).compile();

    service = module.get<FaucetService>(FaucetService);
    repository = module.get<FaucetRepository>(FaucetRepository);
  });

  it('should dispense tokens', async () => {
    const result = await service.dispenseTokens('127.0.0.1', 'test-address');
    expect(result.tokens).toEqual(10);
  });

  it('should rate limit', async () => {
    await service.dispenseTokens('127.0.0.1', 'test-address');
    await expect(service.dispenseTokens('127.0.0.1', 'test-address')).rejects.toThrowError('Rate limit exceeded');
  });
});