import { MerklePatriciaTrie } from '../trie/MerklePatriciaTrie';
import { Account } from '../account/Account';
import { Transaction } from '../transaction/Transaction';
import { BlockHeader } from '../block/BlockHeader';

export class StateManager {
  private trie: MerklePatriciaTrie;

  constructor() {
    this.trie = new MerklePatriciaTrie();
  }

  async getBalance(address: string): Promise<number> {
    const account = await this.getAccount(address);
    return account.balance;
  }

  async getAccount(address: string): Promise<Account> {
    const accountData = await this.trie.get(address);
    if (!accountData) {
      return new Account(address, 0);
    }
    return Account.fromBytes(accountData);
  }

  async updateBalance(address: string, balance: number): Promise<void> {
    const account = await this.getAccount(address);
    account.balance = balance;
    await this.trie.put(address, account.toBytes());
  }

  async applyTransaction(tx: Transaction, blockHeader: BlockHeader): Promise<void> {
    const senderAccount = await this.getAccount(tx.from);
    senderAccount.balance -= tx.value;
    senderAccount.nonce += 1;
    await this.trie.put(tx.from, senderAccount.toBytes());

    const receiverAccount = await this.getAccount(tx.to);
    receiverAccount.balance += tx.value;
    await this.trie.put(tx.to, receiverAccount.toBytes());
  }

  async getStateRoot(): Promise<string> {
    return this.trie.getRootHash();
  }
}