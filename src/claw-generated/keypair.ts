import { randomBytes } from 'crypto';
import { argon2 } from 'argon2-wasm';

export class KeyPair {
  private _publicKey: Uint8Array;
  private _privateKey: Uint8Array;

  constructor(publicKey: Uint8Array, privateKey: Uint8Array) {
    this._publicKey = publicKey;
    this._privateKey = privateKey;
  }

  get publicKey(): Uint8Array {
    return this._publicKey;
  }

  get privateKey(): Uint8Array {
    return this._privateKey;
  }

  static async generate(password: string): Promise<KeyPair> {
    const keyBytes = await argon2.hash(randomBytes(32), password);
    return new KeyPair(keyBytes.slice(0, 32), keyBytes.slice(32));
  }

  static async fromEncryptedFile(
    password: string,
    encryptedData: Uint8Array
  ): Promise<KeyPair> {
    const keyBytes = await argon2.hash(encryptedData, password);
    return new KeyPair(keyBytes.slice(0, 32), keyBytes.slice(32));
  }

  async toEncryptedFile(password: string): Promise<Uint8Array> {
    const keyBytes = new Uint8Array([...this._publicKey, ...this._privateKey]);
    return await argon2.hash(keyBytes, password);
  }
}