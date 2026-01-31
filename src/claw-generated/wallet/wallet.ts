import { EncryptedKeypair } from './keypair';

export class Wallet {
  private encryptedKeypair: EncryptedKeypair;

  constructor(password: string, keypair: Uint8Array) {
    this.encryptedKeypair = new EncryptedKeypair(password, keypair);
  }

  public async getKeypair(password: string): Promise<Uint8Array> {
    return await this.encryptedKeypair.decrypt(password);
  }

  public serialize(): string {
    return this.encryptedKeypair.serialize();
  }

  public static deserialize(serializedData: string, password: string): Wallet {
    const encryptedKeypair = EncryptedKeypair.deserialize(serializedData);
    return new Wallet(password, encryptedKeypair.keypair);
  }
}