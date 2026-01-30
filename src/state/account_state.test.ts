import { AccountState } from './account_state';
import { MerklePatriciaTrie } from './trie';

describe('AccountState', () => {
  let accountState: AccountState;

  beforeEach(() => {
    const trie = new MerklePatriciaTrie();
    accountState = new AccountState(trie);
  });

  it('should set and get storage values', async () => {
    const address = '0x1234567890abcdef';
    await accountState.setStorageValue(address, 'key1', 'value1');
    await accountState.setStorageValue(address, 'key2', 'value2');

    const value1 = await accountState.getStorageValue(address, 'key1');
    const value2 = await accountState.getStorageValue(address, 'key2');

    expect(value1).toEqual('value1');
    expect(value2).toEqual('value2');
  });

  it('should handle missing storage values', async () => {
    const address = '0x1234567890abcdef';
    const value = await accountState.getStorageValue(address, 'key1');
    expect(value).toBeNull();
  });
});