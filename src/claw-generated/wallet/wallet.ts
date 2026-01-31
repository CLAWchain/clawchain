import { KeyPair } from './keypair';

export class Wallet {
  private _keyPair: KeyPair;

  constructor(keyPair: KeyPair) {
    this._keyPair = keyPair;
  }

  get publicKey(): Uint8Array {
    return this._keyPair.publicKey;
  }

  get privateKey(): Uint8Array {
    return this._keyPair.privateKey;
  }

  static async create(password: string): Promise<Wallet> {
    const keyPair = await KeyPair.generate(password);
    return new Wallet(keyPair);
  }

  static async fromEncryptedFile(
    password: string,
    encryptedData: Uint8Array
  ): Promise<Wallet> {
    const keyPair = await KeyPair.fromEncryptedFile(password, encryptedData);
    return new Wallet(keyPair);
  }

  async saveToEncryptedFile(password: string): Promise<Uint8Array> {
    return await this._keyPair.toEncryptedFile(password);
  }
}