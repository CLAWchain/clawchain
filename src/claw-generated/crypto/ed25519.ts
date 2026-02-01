import * as nacl from 'tweetnacl';

export class Ed25519Keypair {
  readonly publicKey: Uint8Array;
  readonly secretKey: Uint8Array;

  constructor() {
    const keyPair = nacl.sign.keyPair();
    this.publicKey = keyPair.publicKey;
    this.secretKey = keyPair.secretKey;
  }

  sign(message: string): string {
    const signature = nacl.sign.detached(
      new TextEncoder().encode(message),
      this.secretKey
    );
    return Buffer.from(signature).toString('hex');
  }
}