import { argon2 } from 'argon2-wasm';

export class EncryptedKeypair {
  private encryptedData: Buffer;
  private salt: Buffer;

  constructor(private password: string, private keypair: Uint8Array) {
    this.generateEncryptedData();
  }

  private async generateEncryptedData() {
    this.salt = await argon2.hash(this.password);
    this.encryptedData = await argon2.encrypt(this.keypair, this.salt);
  }

  public async decrypt(): Promise<Uint8Array> {
    return await argon2.decrypt(this.encryptedData, this.salt, this.password);
  }

  public serialize(): string {
    return JSON.stringify({
      encryptedData: this.encryptedData.toString('hex'),
      salt: this.salt.toString('hex')
    });
  }

  public static deserialize(serializedData: string): EncryptedKeypair {
    const { encryptedData, salt } = JSON.parse(serializedData);
    return new EncryptedKeypair('', Buffer.from(encryptedData, 'hex'));
  }
}