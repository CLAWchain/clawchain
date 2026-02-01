import { generateKeyPair, deriveAddress, generateMnemonic, mnemonicToSeedSync } from './index';

describe('Wallet', () => {
  it('should generate a valid Ed25519 keypair', () => {
    const { publicKey, privateKey } = generateKeyPair();
    expect(publicKey.length).toEqual(32);
    expect(privateKey.length).toEqual(64);
  });

  it('should derive a valid base58 address from a public key', () => {
    const { publicKey } = generateKeyPair();
    const address = deriveAddress(publicKey);
    expect(address.length).toBeGreaterThan(0);
  });

  it('should generate a valid BIP39 mnemonic', () => {
    const mnemonic = generateMnemonic();
    expect(mnemonic.split(' ').length).toEqual(12);
  });

  it('should derive a seed from a BIP39 mnemonic', () => {
    const mnemonic = generateMnemonic();
    const seed = mnemonicToSeedSync(mnemonic);
    expect(seed.length).toEqual(64);
  });
});