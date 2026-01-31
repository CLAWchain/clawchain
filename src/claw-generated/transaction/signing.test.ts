import { ECDSASigner, Ed25519Signer, TransactionSigner } from './signing';
import { PrivateKey, Signature } from 'crypto-types';
import { ec as EC } from 'elliptic';

describe('TransactionSigner', () => {
  let signer: TransactionSigner;
  let privateKey: PrivateKey;
  let data: Uint8Array;

  beforeEach(() => {
    privateKey = new Uint8Array(32);
    crypto.getRandomValues(privateKey);
    data = new Uint8Array([0x01, 0x02, 0x03]);
  });

  describe('ECDSASigner', () => {
    beforeEach(() => {
      signer = new ECDSASigner();
    });

    it('should sign and verify data', async () => {
      const signature: Signature = await signer.sign(privateKey, data);
      const ec = new EC('secp256k1');
      const key = ec.keyFromPrivate(privateKey);
      const isValid = key.verify(data, {
        r: signature.slice(0, 32),
        s: signature.slice(32)
      });
      expect(isValid).toBe(true);
    });
  });

  describe('Ed25519Signer', () => {
    beforeEach(() => {
      signer = new Ed25519Signer();
    });

    it('should sign and verify data', async () => {
      const signature: Signature = await signer.sign(privateKey, data);
      // Add Ed25519 verification logic here
    });
  });
});