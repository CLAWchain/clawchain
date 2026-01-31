import { Keypair } from './keypair';

describe('Keypair', () => {
  it('should generate a keypair from a seed phrase', () => {
    const seedPhrase = 'abandon amount expire adjust cage candy arch gather drum buyer index expire adjust';
    const keypair = Keypair.fromSeedPhrase(seedPhrase);

    expect(keypair.privateKey.length).toBe(32);
    expect(keypair.publicKey.length).toBe(32);
    expect(keypair.address).toMatch(/^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/);
  });
});