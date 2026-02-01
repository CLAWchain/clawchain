import { Account, Transaction } from './account';
import { MerklePatriciaTrie } from '../trie/trie';

export class WalletAPI {
  private trie: MerklePatriciaTrie;
  private pendingTxs: Transaction[] = [];

  constructor(trie: MerklePatriciaTrie) {
    this.trie = trie;
  }

  public async getBalance(address: string): Promise<number> {
    const account = await this.trie.get<Account>(address);
    return account?.balance || 0;
  }

  public async getTransactionHistory(address: string): Promise<Transaction[]> {
    const account = await this.trie.get<Account>(address);
    const history = account?.transactionHistory || [];
    return [...history, ...this.getPendingTransactions(address)];
  }

  public addPendingTransaction(tx: Transaction) {
    this.pendingTxs.push(tx);
  }

  private getPendingTransactions(address: string): Transaction[] {
    return this.pendingTxs.filter(tx => tx.from === address || tx.to === address);
  }
}