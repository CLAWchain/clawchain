import { randomBytes } from 'crypto';
import { argon2 } from 'argon2-wasm';
import { createCipheriv, createDecipheriv } from 'crypto';

export class EncryptedKeypair {
  private static SALT_LENGTH = 16;
  private static HASH_LENGTH = 32;
  private static CIPHER_ALGORITHM = 'aes-256-gcm';

  private salt: Buffer;
  private encryptedPrivateKey: Buffer;
  private nonce: Buffer;
  private authTag: Buffer;

  constructor(privateKey: Buffer, password: string) {
    this.salt = randomBytes(EncryptedKeypair.SALT_LENGTH);
    const key = this.deriveKey(password);
    this.encryptPrivateKey(privateKey, key);
  }

  private deriveKey(password: string): Buffer {
    return argon2.hash(password, {
      salt: this.salt,
      hashLength: EncryptedKeypair.HASH_LENGTH,
      parallelism: 1,
      memoryCost: 2048,
      timeCost: 1,
      type: argon2.ArgonType.Argon2id
    });
  }

  private encryptPrivateKey(privateKey: Buffer, key: Buffer): void {
    const cipher = createCipheriv(EncryptedKeypair.CIPHER_ALGORITHM, key, this.salt);
    this.nonce = cipher.getAuthTag();
    this.authTag = cipher.getAuthTag();
    this.encryptedPrivateKey = Buffer.concat([
      cipher.update(privateKey),
      cipher.final()
    ]);
  }

  public getEncryptedPrivateKey(): Buffer {
    return this.encryptedPrivateKey;
  }

  public getSalt(): Buffer {
    return this.salt;
  }

  public getNonce(): Buffer {
    return this.nonce;
  }

  public getAuthTag(): Buffer {
    return this.authTag;
  }

  public toSolanaCliFormat(): { secretKey: Uint8Array; publicKey: Uint8Array } {
    return {
      secretKey: this.encryptedPrivateKey,
      publicKey: this.encryptedPrivateKey.slice(0, 32)
    };
  }

  public static async fromSolanaCliFormat(
    solanaCliFormat: { secretKey: Uint8Array; publicKey: Uint8Array },
    salt: Buffer,
    nonce: Buffer,
    authTag: Buffer,
    password: string
  ): Promise<EncryptedKeypair> {
    const privateKey = await this.decryptKeypair(
      Buffer.from(solanaCliFormat.secretKey),
      salt,
      nonce,
      authTag,
      password
    );
    return new EncryptedKeypair(privateKey, password);
  }

  public static async decryptKeypair(
    encryptedPrivateKey: Buffer,
    salt: Buffer,
    nonce: Buffer,
    authTag: Buffer,
    password: string
  ): Promise<Buffer> {
    const key = await this.deriveKey(password);
    const decipher = createDecipheriv(EncryptedKeypair.CIPHER_ALGORITHM, key, salt);
    decipher.setAuthTag(authTag);
    return Buffer.concat([
      decipher.update(encryptedPrivateKey),
      decipher.final()
    ]);
  }
}