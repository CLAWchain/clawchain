import { MerklePatriciaTrie } from './trie';
import { Mutex } from 'async-mutex';

class AccountState {
  private trie: MerklePatriciaTrie;
  private nonceMutex: Mutex;

  constructor(trie: MerklePatriciaTrie) {
    this.trie = trie;
    this.nonceMutex = new Mutex();
  }

  public async getNonce(address: string): Promise<number> {
    const release = await this.nonceMutex.acquire();
    try {
      const nonce = this.trie.get(`${address}/nonce`);
      return nonce ? nonce : 0;
    } finally {
      release();
    }
  }

  public async setNonce(address: string, nonce: number): Promise<void> {
    const release = await this.nonceMutex.acquire();
    try {
      this.trie.put(`${address}/nonce`, nonce);
    } finally {
      release();
    }
  }
}

export { AccountState };