import { Buffer } from 'buffer';
import { ECDSASignature, EdDSASignature } from '../signing';

describe('Signing', () => {
  describe('ECDSA', () => {
    const ecdsa = new ECDSASignature();

    it('should generate key pair', () => {
      const { publicKey, privateKey } = ecdsa.generateKeyPair();
      expect(publicKey).toBeInstanceOf(Buffer);
      expect(privateKey).toBeInstanceOf(Buffer);
    });

    it('should sign and verify', () => {
      const { publicKey, privateKey } = ecdsa.generateKeyPair();
      const message = Buffer.from('hello, world');
      const signature = ecdsa.sign(message, privateKey);
      expect(ecdsa.verify(message, signature, publicKey)).toBe(true);
    });
  });

  describe('EdDSA', () => {
    const eddsa = new EdDSASignature();

    it('should generate key pair', () => {
      const { publicKey, privateKey } = eddsa.generateKeyPair();
      expect(publicKey).toBeInstanceOf(Buffer);
      expect(privateKey).toBeInstanceOf(Buffer);
    });

    it('should sign and verify', () => {
      const { publicKey, privateKey } = eddsa.generateKeyPair();
      const message = Buffer.from('hello, world');
      const signature = eddsa.sign(message, privateKey);
      expect(eddsa.verify(message, signature, publicKey)).toBe(true);
    });
  });
});