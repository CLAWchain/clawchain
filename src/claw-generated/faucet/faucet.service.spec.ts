import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FaucetService } from './faucet.service';
import { FaucetClaimEntity } from './faucet-claim.entity';
import { TokenService } from '../token/token.service';

describe('FaucetService', () => {
  let service: FaucetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FaucetService,
        {
          provide: getRepositoryToken(FaucetClaimEntity),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn()
          }
        },
        {
          provide: TokenService,
          useValue: {
            mint: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<FaucetService>(FaucetService);
  });

  it('should claim tokens successfully', async () => {
    jest.spyOn(service['faucetClaimRepository'], 'findOne').mockResolvedValue(null);
    jest.spyOn(service['tokenService'], 'mint').mockResolvedValue();
    jest.spyOn(service['faucetClaimRepository'], 'create').mockReturnValue({
      address: 'test-address',
      ip: '127.0.0.1',
      claimedAt: new Date()
    });
    jest.spyOn(service['faucetClaimRepository'], 'save').mockResolvedValue();

    const result = await service.claimTokens('test-address', '127.0.0.1');
    expect(result).toEqual({ success: true });
    expect(service['tokenService'].mint).toHaveBeenCalledWith('test-address', 10);
    expect(service['faucetClaimRepository'].create).toHaveBeenCalledWith({
      address: 'test-address',
      ip: '127.0.0.1',
      claimedAt: expect.any(Date)
    });
    expect(service['faucetClaimRepository'].save).toHaveBeenCalled();
  });

  it('should not claim tokens if already claimed today', async () => {
    jest.spyOn(service['faucetClaimRepository'], 'findOne').mockResolvedValue({
      address: 'test-address',
      ip: '127.0.0.1',
      claimedAt: new Date()
    });

    const result = await service.claimTokens('test-address', '127.0.0.1');
    expect(result).toEqual({ success: false, message: 'You can only claim once per day' });
    expect(service['tokenService'].mint).not.toHaveBeenCalled();
  });
});