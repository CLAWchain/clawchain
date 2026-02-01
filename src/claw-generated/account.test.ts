import { Account } from './account';
import { MerklePatriciaTrie } from '../trie/trie';

describe('Account', () => {
  it('should store and retrieve values in the storage trie', () => {
    const account = new Account('0x1234', 1000);

    account.setStorageValue('key1', 'value1');
    account.setStorageValue('key2', 'value2');

    expect(account.getStorageValue('key1')).toEqual('value1');
    expect(account.getStorageValue('key2')).toEqual('value2');
    expect(account.getStorageValue('key3')).toBeUndefined();
  });

  it('should update the balance correctly', () => {
    const account = new Account('0x1234', 1000);

    const tx1 = new Transaction('0x5678', '0x1234', 100, Date.now(), 1);
    const tx2 = new Transaction('0x1234', '0x5678', 50, Date.now(), 2);

    account.addTransaction(tx1);
    expect(account.balance).toEqual(1100);

    account.addTransaction(tx2);
    expect(account.balance).toEqual(1050);
  });
});