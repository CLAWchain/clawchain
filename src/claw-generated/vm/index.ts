import { MerklePatriciaTrie } from '../trie';

export class VirtualMachine {
  trie: MerklePatriciaTrie;

  constructor() {
    this.trie = new MerklePatriciaTrie();
  }

  execute(tx: any): boolean {
    const { from, to, value, nonce } = tx;
    const fromNonce = this.trie.getNonce(from);

    if (nonce <= fromNonce) {
      // Nonce is not greater than the last used nonce, reject the transaction
      return false;
    }

    // Update the account nonce
    this.trie.setNonce(from, nonce);

    // Process the transaction
    this.trie.insert(to, value, 0);
    this.trie.insert(from, value - tx.value, nonce);

    return true;
  }
}