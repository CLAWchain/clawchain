import { generateKeyPair, deriveAddress, generateSeedPhrase, recoverKeyPair } from '../index';

describe('Wallet', () => {
  it('should generate a valid keypair', () => {
    const { publicKey, secretKey } = generateKeyPair();
    expect(publicKey.length).toBe(32);
    expect(secretKey.length).toBe(64);
  });

  it('should derive a valid address from public key', () => {
    const { publicKey } = generateKeyPair();
    const address = deriveAddress(publicKey);
    expect(address.length).toBeGreaterThan(0);
  });

  it('should generate a valid seed phrase', () => {
    const seedPhrase = generateSeedPhrase();
    expect(seedPhrase.split(' ').length).toBe(12);
  });

  it('should recover a keypair from seed phrase', () => {
    const seedPhrase = generateSeedPhrase();
    const { publicKey, secretKey } = recoverKeyPair(seedPhrase);
    expect(publicKey.length).toBe(32);
    expect(secretKey.length).toBe(64);
  });
});