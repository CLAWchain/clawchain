import { Keypair } from './keypair';
import * as fs from 'fs';
import * as path from 'path';

describe('Keypair', () => {
  const testPassword = 'mypassword';
  const testFilePath = path.join('src', 'claw-generated', 'test-keypair.json');

  afterEach(async () => {
    try {
      await fs.promises.unlink(testFilePath);
    } catch (err) {
      // Ignore errors if the file doesn't exist
    }
  });

  it('should generate a new keypair', async () => {
    const keypair = await Keypair.generate(testPassword);
    expect(keypair.publicKey).toBeInstanceOf(Buffer);
    expect(keypair.secretKey).toBeInstanceOf(Buffer);
  });

  it('should save and load a keypair', async () => {
    const keypair = await Keypair.generate(testPassword);
    await Keypair.save(keypair, testPassword, testFilePath);

    const loadedKeypair = await Keypair.load(testPassword, testFilePath);
    expect(loadedKeypair.publicKey.equals(keypair.publicKey)).toBe(true);
    expect(loadedKeypair.secretKey.equals(keypair.secretKey)).toBe(true);
  });
});