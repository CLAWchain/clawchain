import * as ed25519 from 'ed25519-wasm';

export type Ed25519Signature = {
  publicKey: Uint8Array;
  signature: Uint8Array;
};

export function verifyEd25519Signature(
  message: Uint8Array,
  signature: Ed25519Signature
): boolean {
  return ed25519.verify(message, signature.signature, signature.publicKey);
}