import { EncryptedKeypair } from './encrypted_keypair';
import * as nacl from 'tweetnacl';

describe('EncryptedKeypair', () => {
  it('should encrypt and decrypt a keypair', async () => {
    const password = 'mypassword';
    const encryptedKeypair = new EncryptedKeypair(password);
    const decryptedKeypair = await EncryptedKeypair.decryptKeypair(password, encryptedKeypair.getEncryptedKeypair());

    expect(decryptedKeypair.secretKey).toEqual(encryptedKeypair.keypair.secretKey);
    expect(decryptedKeypair.publicKey).toEqual(encryptedKeypair.keypair.publicKey);
  });

  it('should generate a new keypair if not provided', () => {
    const encryptedKeypair = new EncryptedKeypair('password');
    expect(encryptedKeypair.getPublicKey().length).toEqual(32);
  });
});