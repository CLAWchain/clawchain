import { Keypair } from '@solana/web3.js';
import { argon2 } from 'argon2-wasm';

export class EncryptedKeypair {
  private static SALT_LENGTH = 16;

  private keypair: Keypair;
  private encryptedData: Uint8Array;
  private salt: Uint8Array;

  constructor(keypair: Keypair, password: string) {
    this.keypair = keypair;
    this.salt = this.generateSalt();
    this.encryptedData = this.encryptKeypair(password);
  }

  private generateSalt(): Uint8Array {
    const salt = new Uint8Array(EncryptedKeypair.SALT_LENGTH);
    crypto.getRandomValues(salt);
    return salt;
  }

  private encryptKeypair(password: string): Uint8Array {
    const keypairData = this.keypair.secretKey;
    return argon2.hash(keypairData, { salt: this.salt, type: argon2.ArgonType.Argon2id });
  }

  public getEncryptedData(): Uint8Array {
    return this.encryptedData;
  }

  public getSalt(): Uint8Array {
    return this.salt;
  }

  public getKeypair(): Keypair {
    return this.keypair;
  }

  public static async decrypt(encryptedData: Uint8Array, salt: Uint8Array, password: string): Promise<Keypair> {
    const secretKey = await argon2.verify(encryptedData, { salt, type: argon2.ArgonType.Argon2id, password });
    return Keypair.fromSecretKey(secretKey);
  }
}