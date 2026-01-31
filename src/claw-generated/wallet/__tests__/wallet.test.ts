import { Wallet } from '../wallet';

describe('Wallet', () => {
  it('should encrypt and decrypt a keypair', async () => {
    const wallet = new Wallet('mypassword');
    await wallet.generateKeypair();
    const keypair = await wallet.getKeypair();
    expect(keypair.length).toBe(64);
  });
});