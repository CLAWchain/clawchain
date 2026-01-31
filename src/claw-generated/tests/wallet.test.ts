import { expect } from 'chai';
import { KeyPair, Wallet } from '../wallet/keypair';
import { randomBytes } from 'crypto';

describe('Wallet', () => {
  it('should create a new wallet', async () => {
    const password = 'mypassword';
    const wallet = await Wallet.create(password);
    expect(wallet.publicKey).to.be.an.instanceOf(Uint8Array);
    expect(wallet.privateKey).to.be.an.instanceOf(Uint8Array);
  });

  it('should load a wallet from encrypted file', async () => {
    const password = 'mypassword';
    const wallet = await Wallet.create(password);
    const encryptedData = await wallet.saveToEncryptedFile(password);
    const loadedWallet = await Wallet.fromEncryptedFile(password, encryptedData);
    expect(loadedWallet.publicKey).to.deep.equal(wallet.publicKey);
    expect(loadedWallet.privateKey).to.deep.equal(wallet.privateKey);
  });

  it('should throw error for incorrect password', async () => {
    const password = 'mypassword';
    const wallet = await Wallet.create(password);
    const encryptedData = await wallet.saveToEncryptedFile(password);
    await expect(Wallet.fromEncryptedFile('wrongpassword', encryptedData)).to.be.rejectedWith(Error);
  });
});