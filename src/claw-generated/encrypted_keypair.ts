import { argon2 } from 'argon2-wasm';
import * as nacl from 'tweetnacl';

export class EncryptedKeypair {
  private keypair: nacl.KeyPair;
  private encryptedKeypair: Uint8Array;

  constructor(password: string, keypair?: nacl.KeyPair) {
    if (keypair) {
      this.keypair = keypair;
    } else {
      this.keypair = nacl.sign.keyPair();
    }

    this.encryptedKeypair = this.encryptKeypair(password);
  }

  private encryptKeypair(password: string): Uint8Array {
    const salt = nacl.randomBytes(16);
    const key = await argon2.hash(password, { salt });
    return nacl.secretbox(this.keypair.secretKey, salt);
  }

  public getEncryptedKeypair(): Uint8Array {
    return this.encryptedKeypair;
  }

  public getPublicKey(): Uint8Array {
    return this.keypair.publicKey;
  }

  public static async decryptKeypair(password: string, encryptedKeypair: Uint8Array): Promise<nacl.KeyPair> {
    const salt = encryptedKeypair.slice(0, 16);
    const key = await argon2.hash(password, { salt });
    const secretKey = nacl.secretbox.open(encryptedKeypair.slice(16), salt, key);
    return { publicKey: this.keypair.publicKey, secretKey };
  }
}