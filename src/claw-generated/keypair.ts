import * as ed25519 from 'ed25519-wasm';

export class KeyPair {
  public publicKey: string;
  public privateKey: string;

  constructor() {
    const { publicKey, privateKey } = ed25519.createKeyPair();
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  public sign(message: string): string {
    return ed25519.sign(message, this.privateKey);
  }

  public verify(message: string, signature: string): boolean {
    return ed25519.verify(message, signature, this.publicKey);
  }
}