import { generateKeyPair, createTransaction, verifyTransaction, serializeTransaction, deserializeTransaction } from './index';

describe('Wallet', () => {
  it('should generate a valid key pair', () => {
    const { publicKey, privateKey } = generateKeyPair();
    expect(publicKey.length).toEqual(32);
    expect(privateKey.length).toEqual(64);
  });

  it('should create and verify a transaction', () => {
    const fromKeyPair = generateKeyPair();
    const toAddress = generateKeyPair().publicKey;
    const amount = 100;

    const tx = createTransaction(fromKeyPair, toAddress, amount);
    expect(verifyTransaction(tx)).toBe(true);
  });

  it('should serialize and deserialize a transaction', () => {
    const fromKeyPair = generateKeyPair();
    const toAddress = generateKeyPair().publicKey;
    const amount = 100;

    const tx = createTransaction(fromKeyPair, toAddress, amount);
    const serializedTx = serializeTransaction(tx);
    const deserializedTx = deserializeTransaction(serializedTx);

    expect(tx).toEqual(deserializedTx);
  });
});