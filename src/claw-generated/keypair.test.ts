import { Keypair } from './keypair';

describe('Keypair', () => {
  it('generates a new keypair', () => {
    const keypair = Keypair.generate();
    expect(keypair.privateKey.length).toBe(64);
    expect(keypair.publicKey.length).toBe(32);
    expect(keypair.address.length).toBe(44);
  });

  it('derives keypair from seed phrase', () => {
    const seedPhrase = 'abandon amount expire adjust cage candy arch gather drum buyer enemy junior emit';
    const keypair = Keypair.fromSeedPhrase(seedPhrase);
    expect(keypair.privateKey.length).toBe(64);
    expect(keypair.publicKey.length).toBe(32);
    expect(keypair.address.length).toBe(44);
  });
});