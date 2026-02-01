import { TransactionSigner } from './signing';
import { Buffer } from 'buffer';

describe('TransactionSigner', () => {
  let signer: TransactionSigner;

  beforeEach(() => {
    signer = new TransactionSigner();
  });

  test('signs and verifies a transaction', () => {
    const privateKey = Buffer.from('18e14a7b6a307f426a94f8114701e7c8e774e7f9a47e2c2035db29a206321725', 'hex');
    const transaction = { 
      to: '0x1234567890123456789012345678901234567890',
      value: 100,
      nonce: 1
    };

    const signature = signer.signECDSA(privateKey, transaction);
    const publicKey = signer.ec.keyFromPrivate(privateKey).getPublic(false, 'hex');
    const isValid = signer.verifyECDSA(Buffer.from(publicKey, 'hex'), signature, transaction);

    expect(isValid).toBe(true);
  });

  test('detects invalid signatures', () => {
    const privateKey = Buffer.from('18e14a7b6a307f426a94f8114701e7c8e774e7f9a47e2c2035db29a206321725', 'hex');
    const transaction = {
      to: '0x1234567890123456789012345678901234567890',
      value: 100,
      nonce: 1
    };

    const signature = signer.signECDSA(privateKey, transaction);
    const publicKey = signer.ec.keyFromPrivate(Buffer.from('deadbeefdeadbeefdeadbeefdeadbeefdeadbeef', 'hex')).getPublic(false, 'hex');
    const isValid = signer.verifyECDSA(Buffer.from(publicKey, 'hex'), signature, transaction);

    expect(isValid).toBe(false);
  });
});