import { Buffer } from 'buffer';
import { ECDSAScheme } from './ecdsa';
import { EdDSAScheme } from './eddsa';

export interface SignatureScheme {
  name: string;
  sign(privateKey: Buffer, data: Buffer): Buffer;
  verify(publicKey: Buffer, signature: Buffer, data: Buffer): boolean;
}

export class TransactionSigner {
  private schemes: Map<string, SignatureScheme> = new Map();

  constructor() {
    this.registerScheme(ECDSAScheme);
    this.registerScheme(EdDSAScheme);
  }

  registerScheme(scheme: SignatureScheme) {
    this.schemes.set(scheme.name, scheme);
  }

  sign(privateKey: Buffer, data: Buffer, schemeName: string): Buffer {
    const scheme = this.schemes.get(schemeName);
    if (!scheme) {
      throw new Error(`Unsupported signature scheme: ${schemeName}`);
    }
    return scheme.sign(privateKey, data);
  }

  verify(publicKey: Buffer, signature: Buffer, data: Buffer, schemeName: string): boolean {
    const scheme = this.schemes.get(schemeName);
    if (!scheme) {
      throw new Error(`Unsupported signature scheme: ${schemeName}`);
    }
    return scheme.verify(publicKey, signature, data);
  }
}