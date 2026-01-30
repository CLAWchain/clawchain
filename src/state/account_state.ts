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

  public async getStorageValue(address: string, key: string): Promise<string | null> {
    const value = await this.trie.get(`${address}/storage/${key}`);
    return value;
  }

  public async setStorageValue(address: string, key: string, value: string): Promise<void> {
    await this.trie.put(`${address}/storage/${key}`, value);
  }
}

export { AccountState };