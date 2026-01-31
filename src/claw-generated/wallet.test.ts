import { Wallet } from './wallet';
import * as bip39 from 'bip39';
import * as ed25519 from 'ed25519-hd-key';
import * as base58 from 'bs58';

describe('Wallet', () => {
  it('should generate a new keypair', () => {
    const wallet = new Wallet();
    expect(wallet.getPublicKey()).toBeDefined();
    expect(wallet.getPrivateKey()).toBeDefined();
    expect(wallet.getAddress()).toBeDefined();
  });

  it('should derive keypair from seed phrase', () => {
    const seedPhrase = 'abandon amount expire adjust cage candy arch gather drum buyer enemy junior emit';
    const wallet = new Wallet(seedPhrase);
    const seed = bip39.mnemonicToSeedSync(seedPhrase);
    const { publicKey, privateKey } = ed25519.derivePath("m/44'/60'/0'/0/0", seed);
    expect(wallet.getPublicKey()).toEqual(base58.encode(publicKey));
    expect(wallet.getPrivateKey()).toEqual(base58.encode(privateKey));
  });
});