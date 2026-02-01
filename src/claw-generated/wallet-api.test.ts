import { Account, Transaction } from './account';
import { WalletAPI } from './wallet-api';
import { MerklePatriciaTrie } from '../trie/trie';

describe('WalletAPI', () => {
  let trie: MerklePatriciaTrie;
  let api: WalletAPI;

  beforeEach(() => {
    trie = new MerklePatriciaTrie();
    api = new WalletAPI(trie);
  });

  it('should get account balance', async () => {
    const account = new Account('0x123', 100);
    await trie.put('0x123', account);

    const balance = await api.getBalance('0x123');
    expect(balance).toBe(100);
  });

  it('should get transaction history', async () => {
    const account = new Account('0x123', 100);
    account.addTransaction(new Transaction('0x456', '0x123', 50, 1234, 100));
    account.addTransaction(new Transaction('0x123', '0x789', 25, 1235, 101));
    await trie.put('0x123', account);

    api.addPendingTransaction(new Transaction('0x123', '0x456', 10, 1236, 102));

    const history = await api.getTransactionHistory('0x123');
    expect(history.length).toBe(3);
    expect(history[0].from).toBe('0x456');
    expect(history[1].to).toBe('0x789');
    expect(history[2].from).toBe('0x123');
  });
});