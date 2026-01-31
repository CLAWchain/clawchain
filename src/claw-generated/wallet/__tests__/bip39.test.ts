import { generateMnemonic, validateMnemonic } from '../bip39';

describe('BIP-39 Mnemonic', () => {
  it('should generate a valid 12-word mnemonic', () => {
    const mnemonic = generateMnemonic(12);
    expect(mnemonic.split(' ')).toHaveLength(12);
    expect(validateMnemonic(mnemonic)).toBe(true);
  });

  it('should generate a valid 24-word mnemonic', () => {
    const mnemonic = generateMnemonic(24);
    expect(mnemonic.split(' ')).toHaveLength(24);
    expect(validateMnemonic(mnemonic)).toBe(true);
  });

  it('should validate a correct mnemonic', () => {
    const mnemonic = 'abandon amount expire adjust cage candy arch gather drum buyer enemy junior exist';
    expect(validateMnemonic(mnemonic)).toBe(true);
  });

  it('should invalidate an incorrect mnemonic', () => {
    const mnemonic = 'abandon amount expire adjust cage candy arch gather drum buyer enemy junior';
    expect(validateMnemonic(mnemonic)).toBe(false);
  });
});