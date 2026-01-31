import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import * as fs from 'fs';
import * as path from 'path';

export class Keypair {
  private publicKey: Buffer;
  private secretKey: Buffer;

  constructor(publicKey: Buffer, secretKey: Buffer) {
    this.publicKey = publicKey;
    this.secretKey = secretKey;
  }

  static async generate(password: string): Promise<Keypair> {
    const { publicKey, secretKey } = await this.generateKeypair(password);
    return new Keypair(publicKey, secretKey);
  }

  static async generateKeypair(password: string): Promise<{ publicKey: Buffer, secretKey: Buffer }> {
    const { publicKey, secretKey } = crypto.generateKeyPairSync('ed25519', {
      publicKeyEncoding: { type: 'spki', format: 'der' },
      secretKeyEncoding: { type: 'pkcs8', format: 'der' }
    });

    const encryptedSecretKey = await argon2.hash(secretKey, { type: argon2.argon2id });

    return { publicKey, secretKey: encryptedSecretKey };
  }

  static async load(password: string, filepath: string): Promise<Keypair> {
    const { publicKey, secretKey } = await this.loadKeypair(password, filepath);
    return new Keypair(publicKey, secretKey);
  }

  static async loadKeypair(password: string, filepath: string): Promise<{ publicKey: Buffer, secretKey: Buffer }> {
    const data = await fs.promises.readFile(filepath);
    const { publicKey, secretKey } = this.parseKeypairData(data);
    const decryptedSecretKey = await argon2.verify(secretKey, password);
    return { publicKey, secretKey: decryptedSecretKey };
  }

  static async save(keypair: Keypair, password: string, filepath: string): Promise<void> {
    const data = this.serializeKeypairData(keypair.publicKey, keypair.secretKey);
    await fs.promises.writeFile(filepath, data);
  }

  private static parseKeypairData(data: Buffer): { publicKey: Buffer, secretKey: Buffer } {
    // Parse Solana CLI keypair format
    return { publicKey: data.slice(0, 32), secretKey: data.slice(32) };
  }

  private static serializeKeypairData(publicKey: Buffer, secretKey: Buffer): Buffer {
    // Serialize to Solana CLI keypair format
    return Buffer.concat([publicKey, secretKey]);
  }
}