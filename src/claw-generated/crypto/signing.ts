import { Buffer } from 'buffer';
import * as secp256k1 from 'secp256k1';
import * as ed25519 from 'ed25519-hd-key';

export interface SignatureScheme {
  generateKeyPair(): { publicKey: Buffer; privateKey: Buffer };
  sign(message: Buffer, privateKey: Buffer): Buffer;
  verify(message: Buffer, signature: Buffer, publicKey: Buffer): boolean;
}

export class ECDSASignature implements SignatureScheme {
  generateKeyPair(): { publicKey: Buffer; privateKey: Buffer } {
    const { publicKey, privateKey } = secp256k1.keyPair();
    return { publicKey, privateKey };
  }

  sign(message: Buffer, privateKey: Buffer): Buffer {
    return secp256k1.sign(message, privateKey).signature;
  }

  verify(message: Buffer, signature: Buffer, publicKey: Buffer): boolean {
    return secp256k1.verify(message, signature, publicKey);
  }
}

export class EdDSASignature implements SignatureScheme {
  generateKeyPair(): { publicKey: Buffer; privateKey: Buffer } {
    const { publicKey, privateKey } = ed25519.createKeyPair();
    return { publicKey, privateKey };
  }

  sign(message: Buffer, privateKey: Buffer): Buffer {
    return ed25519.sign(message, privateKey);
  }

  verify(message: Buffer, signature: Buffer, publicKey: Buffer): boolean {
    return ed25519.verify(message, signature, publicKey);
  }
}