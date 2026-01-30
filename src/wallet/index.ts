import { EncryptedKeypair, generateEncryptedKeypair, decryptKeypair } from './keypair';

export class Wallet {
  private encryptedKeypair: EncryptedKeypair;

  async generateKeypair(password: string): Promise<void> {
    this.encryptedKeypair = await generateEncryptedKeypair(password);
  }

  async decryptKeypair(password: string): Promise<nacl.SignKeyPair> {
    return await decryptKeypair(this.encryptedKeypair, password);
  }
}