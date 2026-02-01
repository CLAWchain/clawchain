import { Keypair } from '../../crypto';
import { TransactionSigner, Transaction, Signature } from '../index';

describe('TransactionSigner', () => {
  it('should sign a transaction', () => {
    const keypair = Keypair.generate();
    const signer = new TransactionSigner(keypair);

    const tx: Transaction = {
      sender: keypair.publicKey,
      recipient: 'recipient_address',
      amount: 100,
      data: 'test transaction'
    };

    const signature = signer.signTransaction(tx);

    expect(signature.value).toBeDefined();
    expect(signature.publicKey).toBe(keypair.publicKey);
    expect(signature.scheme).toBe('ECDSA');
  });
});