import { GenesisService } from '../GenesisService';
import { GENESIS_CONFIG } from '../genesis';

describe('GenesisService', () => {
  it('should load the genesis configuration correctly', () => {
    const genesisService = new GenesisService();
    expect(genesisService.getChainId()).toEqual(GENESIS_CONFIG.chainId);
    expect(genesisService.getAllocations()).toEqual(GENESIS_CONFIG.allocations);
    expect(genesisService.getProtocolParams()).toEqual(GENESIS_CONFIG.protocolParams);
  });
});