import { MerklePatriciaTrie } from '../merkle_patricia_trie';
import { Transaction } from '../transaction/transaction';

class ChainReorg {
  private trie: MerklePatriciaTrie;
  private transactions: Transaction[];

  constructor(trie: MerklePatriciaTrie, transactions: Transaction[]) {
    this.trie = trie;
    this.transactions = transactions;
  }

  detectReorg(newRoot: string): boolean {
    const currentRoot = this.trie.nodeToHex(this.trie.root);
    if (newRoot !== currentRoot) {
      console.log('Chain reorganization detected!');
      return true;
    }
    return false;
  }

  revertTransactions(): void {
    // Revert transactions that are no longer part of the canonical chain
    console.log('Reverting transactions...');
    this.transactions = [];
  }

  replayTransactions(): void {
    // Replay reverted transactions on the new chain
    console.log('Replaying transactions...');
    for (const tx of this.transactions) {
      // Replay transaction on the new chain
      console.log(`Replaying transaction: ${tx.id}`);
    }
  }
}

export { ChainReorg };