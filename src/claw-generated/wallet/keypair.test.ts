import { generateKeypair, recoverKeypairFromSeedPhrase } from './keypair';
import * as bip39 from 'bip39';

describe('Wallet Keypair', () => {
  it('should generate a new keypair', () => {
    const keypair = generateKeypair();
    expect(keypair.publicKey).toBeDefined();
    expect(keypair.privateKey).toBeDefined();
  });

  it('should recover a keypair from a seed phrase', () => {
    const seedPhrase = 'abandon amount expire adjust cage candy arch gather drum buyer index expire adjust';
    const keypair = recoverKeypairFromSeedPhrase(seedPhrase);
    expect(keypair.publicKey).toBeDefined();
    expect(keypair.privateKey).toBeDefined();
  });

  it('should derive the same keypair from the same seed phrase', () => {
    const seedPhrase = 'abandon amount expire adjust cage candy arch gather drum buyer index expire adjust';
    const keypair1 = recoverKeypairFromSeedPhrase(seedPhrase);
    const keypair2 = recoverKeypairFromSeedPhrase(seedPhrase);
    expect(keypair1.publicKey).toEqual(keypair2.publicKey);
    expect(keypair1.privateKey).toEqual(keypair2.privateKey);
  });
});