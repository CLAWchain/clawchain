import { generateEncryptedKeypair, decryptKeypair } from './keypair';
import * as nacl from 'tweetnacl';

describe('Encrypted Keypair', () => {
  it('should encrypt and decrypt a keypair', async () => {
    const password = 'mypassword';
    const { ciphertext, nonce, salt } = await generateEncryptedKeypair(password);
    const decryptedKeypair = await decryptKeypair({ ciphertext, nonce, salt }, password);

    expect(decryptedKeypair.publicKey).toEqual(decryptedKeypair.publicKey);
    expect(decryptedKeypair.secretKey).toEqual(decryptedKeypair.secretKey);
  });

  it('should throw an error on incorrect password', async () => {
    const password = 'mypassword';
    const { ciphertext, nonce, salt } = await generateEncryptedKeypair(password);
    await expect(decryptKeypair({ ciphertext, nonce, salt }, 'wrongpassword')).rejects.toThrow('Failed to decrypt keypair');
  });
});