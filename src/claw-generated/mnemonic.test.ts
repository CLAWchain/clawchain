import { Mnemonic } from './mnemonic';

describe('Mnemonic', () => {
  it('should generate a valid 12-word phrase', () => {
    const phrase = Mnemonic.generatePhrase(12);
    expect(Mnemonic.validatePhrase(phrase)).toBe(true);
  });

  it('should generate a valid 24-word phrase', () => {
    const phrase = Mnemonic.generatePhrase(24);
    expect(Mnemonic.validatePhrase(phrase)).toBe(true);
  });

  it('should derive the seed from a mnemonic phrase', () => {
    const phrase = Mnemonic.generatePhrase(12);
    const seed = Mnemonic.seedFromPhrase(phrase);
    expect(seed).toBeInstanceOf(Buffer);
    expect(seed.length).toBe(64);
  });
});