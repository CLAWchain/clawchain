import { Wallet } from './wallet';

describe('Wallet', () => {
  it('should generate a new keypair', () => {
    const wallet = new Wallet();
    expect(wallet.publicKey.length).toBe(32);
    expect(wallet.privateKey.length).toBe(64);
  });

  it('should derive the address from the public key', () => {
    const wallet = new Wallet();
    const address = wallet.address;
    expect(address.length).toBeGreaterThan(0);
  });

  it('should generate a seed phrase and recover the wallet', () => {
    const wallet = new Wallet();
    const seedPhrase = wallet.seedPhrase;
    const recoveredWallet = Wallet.fromSeedPhrase(seedPhrase);
    expect(recoveredWallet.publicKey).toEqual(wallet.publicKey);
    expect(recoveredWallet.privateKey).toEqual(wallet.privateKey);
  });
});