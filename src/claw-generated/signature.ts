import * as ed25519 from 'ed25519-wasm';

export class Ed25519Signature {
  public static verify(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): boolean {
    return ed25519.verify(publicKey, message, signature);
  }
}