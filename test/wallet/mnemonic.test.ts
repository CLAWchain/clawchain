import { generateMnemonic, validateMnemonic } from '../../src/wallet/mnemonic';

describe('Mnemonic', () => {
  it('should generate a 12-word mnemonic', () => {
    const mnemonic = generateMnemonic(12);
    expect(mnemonic).toHaveLength(12);
  });

  it('should generate a 24-word mnemonic', () => {
    const mnemonic = generateMnemonic(24);
    expect(mnemonic).toHaveLength(24);
  });

  it('should validate a correct mnemonic', () => {
    const mnemonic = generateMnemonic(12);
    expect(validateMnemonic(mnemonic)).toBe(true);
  });

  // TODO: Add more tests for invalid mnemonics
});