import { Wallet } from './wallet';
import { MultisigWallet } from './multisig-wallet';

describe('MultisigWallet', () => {
  it('should create and verify a multisig transaction', () => {
    const owner1 = new Wallet();
    const owner2 = new Wallet();
    const owner3 = new Wallet();

    const multisigWallet = new MultisigWallet([owner1, owner2, owner3], 2);

    const message = 'Transfer 10 tokens';
    const transaction = multisigWallet.createTransaction(message);

    expect(multisigWallet.verifyTransaction(transaction)).toBe(true);
  });
});