import { Mnemonic } from './mnemonic';

describe('Mnemonic', () => {
  it('generates a valid 12-word mnemonic', () => {
    const mnemonic = Mnemonic.generateMnemonic(12);
    expect(Mnemonic.validateMnemonic(mnemonic)).toBe(true);
  });

  it('generates a valid 24-word mnemonic', () => {
    const mnemonic = Mnemonic.generateMnemonic(24);
    expect(Mnemonic.validateMnemonic(mnemonic)).toBe(true);
  });

  it('rejects an invalid mnemonic', () => {
    const invalidMnemonic = 'this is not a valid mnemonic';
    expect(Mnemonic.validateMnemonic(invalidMnemonic)).toBe(false);
  });
});