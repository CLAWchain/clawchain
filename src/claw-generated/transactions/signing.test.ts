import { TransactionSigner } from './signing';

describe('TransactionSigner', () => {
  const signer = new TransactionSigner();
  const privateKey = '0x...'; // Replace with a valid private key
  const transaction = {
    to: '0x...', 
    value: 1000,
    nonce: 1
  };

  it('should sign a transaction', () => {
    const signedTx = signer.sign(transaction, privateKey);
    expect(signedTx.r).toBeDefined();
    expect(signedTx.s).toBeDefined();
    expect(signedTx.v).toBeDefined();
  });

  it('should verify a signed transaction', () => {
    const signedTx = signer.sign(transaction, privateKey);
    const publicKey = signer.ec.keyFromPrivate(privateKey, 'hex').getPublic('hex');
    const isValid = signer.verify(transaction, publicKey, signedTx);
    expect(isValid).toBe(true);
  });
});