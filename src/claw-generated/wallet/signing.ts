import { Buffer } from 'buffer';
import { keccak256 } from 'js-sha3';
import { ec as EC } from 'elliptic';
import { randomBytes } from 'crypto';

const ec = new EC('secp256k1');

export interface SignatureScheme {
  generateKeyPair(): { publicKey: Buffer; privateKey: Buffer };
  sign(message: Buffer, privateKey: Buffer): Buffer;
  verify(message: Buffer, signature: Buffer, publicKey: Buffer): boolean;
}

export class ECDSASignatureScheme implements SignatureScheme {
  generateKeyPair(): { publicKey: Buffer; privateKey: Buffer } {
    const key = ec.genKeyPair();
    return {
      publicKey: Buffer.from(key.getPublic(false, 'hex'), 'hex'),
      privateKey: Buffer.from(key.getPrivate(false, 'hex'), 'hex'),
    };
  }

  sign(message: Buffer, privateKey: Buffer): Buffer {
    const key = ec.keyFromPrivate(privateKey);
    const signature = key.sign(message);
    return Buffer.from(signature.toDER());
  }

  verify(message: Buffer, signature: Buffer, publicKey: Buffer): boolean {
    const key = ec.keyFromPublic(publicKey);
    return key.verify(message, signature);
  }
}

export class EdDSASignatureScheme implements SignatureScheme {
  generateKeyPair(): { publicKey: Buffer; privateKey: Buffer } {
    const privateKey = randomBytes(32);
    const publicKey = Buffer.from(ed25519.getPublicKey(privateKey));
    return { publicKey, privateKey };
  }

  sign(message: Buffer, privateKey: Buffer): Buffer {
    return Buffer.from(ed25519.sign(message, privateKey));
  }

  verify(message: Buffer, signature: Buffer, publicKey: Buffer): boolean {
    return ed25519.verify(message, signature, publicKey);
  }
}

export function hashMessage(message: Buffer): Buffer {
  return Buffer.from(keccak256(message), 'hex');
}