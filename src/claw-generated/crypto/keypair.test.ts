import { generateKeypair, deriveKeypairFromSeedPhrase, getAddressFromPublicKey } from './keypair';

describe('Keypair', () => {
  it('should generate a random keypair', () => {
    const { privateKey, publicKey } = generateKeypair();
    expect(privateKey).toBeDefined();
    expect(publicKey).toBeDefined();
    expect(privateKey.length).toEqual(32);
    expect(publicKey.length).toEqual(32);
  });

  it('should derive a keypair from a seed phrase', () => {
    const seedPhrase = 'abandon amount expire adjust cage candy arch gather drum buyer enemy junior emit';
    const { privateKey, publicKey } = deriveKeypairFromSeedPhrase(seedPhrase);
    expect(privateKey).toBeDefined();
    expect(publicKey).toBeDefined();
    expect(privateKey.length).toEqual(32);
    expect(publicKey.length).toEqual(32);
  });

  it('should convert a public key to a base58 address', () => {
    const { publicKey } = generateKeypair();
    const address = getAddressFromPublicKey(publicKey);
    expect(address).toBeDefined();
    expect(typeof address).toEqual('string');
    expect(address.length).toBeGreaterThan(0);
  });
});