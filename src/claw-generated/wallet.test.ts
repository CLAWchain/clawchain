import { Wallet, Transaction, SignedTransaction } from './wallet';
import { Ed25519KeyPair } from '../crypto/ed25519';

describe('Wallet', () => {
  it('should generate a valid Ed25519 key pair', () => {
    const wallet = new Wallet();
    const publicKey = wallet.getPublicKey();
    const privateKey = wallet.getPrivateKey();

    expect(publicKey.length).toBe(32);
    expect(privateKey.length).toBe(64);
    
    const keyPair = new Ed25519KeyPair(publicKey, privateKey);
    expect(keyPair.verify(new Uint8Array(), new Uint8Array())).toBe(true);
  });

  it('should sign a transaction', () => {
    const wallet = new Wallet();
    const transaction: Transaction = {
      serialize: () => new Uint8Array([1, 2, 3, 4, 5])
    };

    const signedTransaction: SignedTransaction = wallet.signTransaction(transaction);
    expect(signedTransaction.transaction).toBe(transaction);
    expect(signedTransaction.signature.length).toBe(64);
  });
});