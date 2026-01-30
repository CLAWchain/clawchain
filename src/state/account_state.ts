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

  public async deleteStorageValue(address: string, key: string): Promise<void> {
    await this.trie.delete(`${address}/storage/${key}`);
  }

  public async getStorageMapping(address: string, key: string): Promise<{ [key: string]: string }> {
    const mapping: { [key: string]: string } = {};
    const keys = await this.trie.getKeysWithPrefix(`${address}/storage/${key}/`);
    for (const k of keys) {
      const value = await this.trie.get(k);
      mapping[k.split('/').pop()!] = value!;
    }
    return mapping;
  }

  public async setStorageMapping(address: string, key: string, mapping: { [key: string]: string }): Promise<void> {
    for (const [k, v] of Object.entries(mapping)) {
      await this.trie.put(`${address}/storage/${key}/${k}`, v);
    }
  }

  public async getStorageArray(address: string, key: string): Promise<string[]> {
    const array: string[] = [];
    let i = 0;
    while (true) {
      const value = await this.trie.get(`${address}/storage/${key}/${i}`);
      if (value === null) break;
      array.push(value);
      i++;
    }
    return array;
  }

  public async setStorageArray(address: string, key: string, array: string[]): Promise<void> {
    for (let i = 0; i < array.length; i++) {
      await this.trie.put(`${address}/storage/${key}/${i}`, array[i]);
    }
  }
}

export { AccountState };