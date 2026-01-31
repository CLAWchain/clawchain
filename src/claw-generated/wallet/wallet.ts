import { EncryptedKeypair, encryptKeypair, decryptKeypair } from './keypair';

export class Wallet {
  private encryptedKeypair: EncryptedKeypair;

  constructor(private password: string) {}

  async generateKeypair(): Promise<void> {
    // TODO: Generate a new keypair and encrypt it
    this.encryptedKeypair = await encryptKeypair(new Uint8Array(64), this.password);
  }

  async getKeypair(): Promise<Uint8Array> {
    return await decryptKeypair(this.encryptedKeypair, this.password);
  }
}