import { verifyTransactionSignature, Transaction } from './transaction';
import * as nacl from 'tweetnacl';
import * as bs58 from 'bs58';

describe('verifyTransactionSignature', () => {
  it('should verify a valid transaction signature', () => {
    // Generate a keypair
    const { publicKey, privateKey } = nacl.sign.keyPair();

    // Create a transaction
    const tx: Transaction = {
      id: 'tx1',
      fromPublicKey: bs58.encode(Buffer.from(publicKey)),
      toPublicKey: 'recipient-public-key',
      amount: 100,
      signature: '',
    };

    // Sign the transaction
    const signature = nacl.sign.detached(
      Buffer.from(JSON.stringify(tx), 'utf8'),
      privateKey
    );
    tx.signature = bs58.encode(signature);

    // Verify the signature
    expect(verifyTransactionSignature(tx)).toBe(true);
  });

  it('should reject an invalid transaction signature', () => {
    // Generate a keypair
    const { publicKey, privateKey } = nacl.sign.keyPair();

    // Create a transaction
    const tx: Transaction = {
      id: 'tx1',
      fromPublicKey: bs58.encode(Buffer.from(publicKey)),
      toPublicKey: 'recipient-public-key',
      amount: 100,
      signature: '',
    };

    // Sign the transaction
    const signature = nacl.sign.detached(
      Buffer.from(JSON.stringify(tx), 'utf8'),
      privateKey
    );
    tx.signature = bs58.encode(signature);

    // Modify the transaction to make it invalid
    tx.amount = 200;

    // Verify the signature
    expect(verifyTransactionSignature(tx)).toBe(false);
  });
});