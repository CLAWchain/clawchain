import * as crypto from 'crypto';

export class KeyPair {
  private privateKey: Buffer;
  public publicKey: Buffer;

  constructor(privateKey?: Buffer) {
    if (privateKey) {
      this.privateKey = privateKey;
      this.publicKey = this.getPublicKey();
    } else {
      this.generateKeyPair();
    }
  }

  /**
   * Generates a new random key pair.
   */
  private generateKeyPair(): void {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'secp256k1',
      publicKeyEncoding: {
        type: 'spki',
        format: 'der',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'der',
      },
    });

    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  /**
   * Derives the public key from the private key.
   * @returns The public key.
   */
  private getPublicKey(): Buffer {
    return crypto.publicKeyCreate(this.privateKey, false);
  }
}