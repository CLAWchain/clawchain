import { EncryptedKeypair, encryptKeypair, decryptKeypair } from './keypair';
import { generateMnemonic, mnemonicToSeedSync } from './bip39';

export class Wallet {
  private encryptedKeypair: EncryptedKeypair;
  private mnemonic: string;

  constructor(private password: string) {}

  async generateKeypairFromMnemonic(): Promise<void> {
    this.mnemonic = generateMnemonic();
    const seed = mnemonicToSeedSync(this.mnemonic, this.password);
    this.encryptedKeypair = await encryptKeypair(seed, this.password);
  }

  async getKeypairFromMnemonic(): Promise<Uint8Array> {
    const seed = mnemonicToSeedSync(this.mnemonic, this.password);
    return await decryptKeypair(this.encryptedKeypair, this.password);
  }

  getMnemonic(): string {
    return this.mnemonic;
  }

  async restoreFromMnemonic(mnemonic: string): Promise<void> {
    this.mnemonic = mnemonic;
    const seed = mnemonicToSeedSync(this.mnemonic, this.password);
    this.encryptedKeypair = await encryptKeypair(seed, this.password);
  }
}