import { generateKeypair } from './keypair';

describe('generateKeypair', () => {
  it('should generate a valid keypair from a seed phrase', () => {
    const seedPhrase = 'abandon amount expire adjust cage candy arch gather drum buyer coast expire adjust';
    const { publicKey, privateKey } = generateKeypair(seedPhrase);

    expect(publicKey).toBeDefined();
    expect(privateKey).toBeDefined();
    expect(publicKey.length).toBeGreaterThan(0);
    expect(privateKey.length).toBeGreaterThan(0);
  });
});