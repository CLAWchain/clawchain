import { Wallet } from './wallet';
import { Transaction } from './transaction';

describe('Wallet', () => {
  it('should generate a key pair', () => {
    const wallet = new Wallet();
    expect(wallet.getPublicKey().length).toBe(32);
    expect(wallet.getPrivateKey().length).toBe(64);
  });

  it('should sign a transaction', () => {
    const wallet = new Wallet();
    const recipient = new Uint8Array(32).fill(0x01);
    const amount = 100;
    const { transaction, signature } = wallet.signTransaction(new Transaction(wallet.getPublicKey(), recipient, amount));
    expect(transaction.serialize().length).toBeGreaterThan(0);
    expect(signature.length).toBe(64);
  });
});