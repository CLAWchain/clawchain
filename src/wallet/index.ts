import { EncryptedKeypair, generateEncryptedKeypair, decryptKeypair } from './keypair';
import { MultisigWallet, createMultisigWallet, verifyMultisigTransaction } from './multisig';

export class Wallet {
  private encryptedKeypair: EncryptedKeypair;
  private multisigWallet: MultisigWallet | null = null;

  async generateKeypair(password: string): Promise<void> {
    this.encryptedKeypair = await generateEncryptedKeypair(password);
  }

  async decryptKeypair(password: string): Promise<nacl.SignKeyPair> {
    return await decryptKeypair(this.encryptedKeypair, password);
  }

  async createMultisigWallet(
    authorizedSigners: EncryptedKeypair[],
    requiredSignatures: number,
    password: string
  ): Promise<void> {
    this.multisigWallet = await createMultisigWallet(
      authorizedSigners,
      requiredSignatures,
      password
    );
  }

  async verifyMultisigTransaction(
    signatures: nacl.Signature[],
    password: string
  ): Promise<boolean> {
    if (!this.multisigWallet) {
      return false;
    }

    return await verifyMultisigTransaction(
      this.multisigWallet,
      password,
      signatures
    );
  }
}