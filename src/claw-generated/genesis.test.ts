import assert from 'assert';
import { loadGenesisConfig } from './genesis';

describe('Genesis Configuration', () => {
  it('should load the genesis configuration', () => {
    const config = loadGenesisConfig();
    assert.strictEqual(config.chainId, 'claw-chain-1');
    assert.deepStrictEqual(config.initialAllocation, {
      '0x1234567890123456789012345678901234567890': 1000000,
      '0x0987654321098765432109876543210987654321': 500000
    });
    assert.deepStrictEqual(config.blockParams, {
      difficulty: 1000000,
      gasLimit: 8000000
    });
  });
});