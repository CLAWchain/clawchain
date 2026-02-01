import { Buffer } from 'buffer';
import { SignatureScheme } from './signing';
import * as ed25519 from 'ed25519-hd-key';

export const EdDSAScheme: SignatureScheme = {
  name: 'EdDSA',
  sign(privateKey: Buffer, data: Buffer): Buffer {
    const signature = ed25519.sign(data, privateKey);
    return Buffer.from(signature);
  },
  verify(publicKey: Buffer, signature: Buffer, data: Buffer): boolean {
    return ed25519.verify(data, signature, publicKey);
  }
};