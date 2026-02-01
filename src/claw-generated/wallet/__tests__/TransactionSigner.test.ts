import { Keypair } from '../keypair';
import { TransactionSigner, Transaction, Signature } from '../index';

describe('TransactionSigner', () => {
  it('should sign a transaction', () => {
    const keypair = Keypair.generate();
    const signer = new TransactionSigner(keypair);

    const tx: Transaction = {
      sender: keypair.publicKey,
      recipient: '0x1234567890abcdef',
      amount: 100,
      data: 'test transaction'
    };

    const signature: Signature = signer.signTransaction(tx);
    expect(signature.publicKey).toBe(keypair.publicKey);
    expect(signature.scheme).toBe('ECDSA');
    expect(typeof signature.value).toBe('string');
  });

  it('should return supported schemes', () => {
    const signer = new TransactionSigner(Keypair.generate());
    expect(signer.supportedSchemes()).toEqual(['ECDSA']);
  });
});