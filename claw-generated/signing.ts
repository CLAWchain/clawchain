import { PrivateKey, PublicKey, Signature } from './crypto';

export interface TransactionSignature {
  publicKey: PublicKey;
  signature: Signature;
}

export class TransactionSigner {
  static sign(privateKey: PrivateKey, message: Uint8Array): TransactionSignature {
    const signature = privateKey.sign(message);
    return {
      publicKey: privateKey.toPublicKey(),
      signature
    };
  }

  static verify(publicKey: PublicKey, message: Uint8Array, signature: Signature): boolean {
    return publicKey.verify(message, signature);
  }
}