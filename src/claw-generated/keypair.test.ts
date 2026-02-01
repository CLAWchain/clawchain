import { generateKeypair, Keypair } from './keypair';

describe('Keypair', () => {
  it('should generate a new keypair', () => {
    const keypair = generateKeypair();
    expect(keypair.publicKey.length).toBe(32);
    expect(keypair.privateKey.length).toBe(64);
    expect(keypair.address).toMatch(/^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/);
  });

  it('should generate a keypair from a seed phrase', () => {
    const seedPhrase = 'abandon amount expire adjust cage candy arch gather drum buyer enemy oxygen plant adjust claim';
    const keypair = generateKeypair(seedPhrase);
    expect(keypair.publicKey.length).toBe(32);
    expect(keypair.privateKey.length).toBe(64);
    expect(keypair.address).toBe('1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lku1T');
  });
});