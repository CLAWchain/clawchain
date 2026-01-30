import { MerklePatriciaTrie } from './trie';

class AccountState {
  private trie: MerklePatriciaTrie;

  constructor(trie: MerklePatriciaTrie) {
    this.trie = trie;
  }

  public getNonce(address: string): number {
    const nonce = this.trie.get(`${address}/nonce`);
    return nonce ? nonce : 0;
  }

  public setNonce(address: string, nonce: number): void {
    this.trie.put(`${address}/nonce`, nonce);
  }
}

export { AccountState };