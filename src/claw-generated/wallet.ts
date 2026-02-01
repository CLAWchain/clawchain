import { generateKeyPair } from '../crypto';

export class Wallet {
  public publicKey: string;
  public privateKey: string;

  constructor() {
    const { publicKey, privateKey } = generateKeyPair();
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  sign(message: string): string {
    // TODO: Implement signing logic
    return 'signed_message';
  }

  verify(message: string, signature: string): boolean {
    // TODO: Implement verification logic
    return true;
  }
}