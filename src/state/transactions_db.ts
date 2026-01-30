import { Account } from "./account";
import { MerklePatriciaTrie } from "./merkle_patricia_trie";

export interface TransactionSignature {
  signature: Uint8Array;
  slot: number;
  blockTime: number;
}

export class TransactionsDb {
  private trie: MerklePatriciaTrie;

  constructor() {
    this.trie = new MerklePatriciaTrie();
  }

  async getSignaturesForAddress(
    address: Uint8Array,
    { limit = 20, before, until }: {
      limit?: number;
      before?: Uint8Array;
      until?: Uint8Array;
    }
  ): Promise<TransactionSignature[]> {
    const signatures = await this.trie.getNodesByPrefix(address);
    // Filter, sort, and paginate the signatures here
    return signatures.map(({ signature, slot, blockTime }) => ({
      signature,
      slot,
      blockTime
    }));
  }

  async addTransaction(
    signature: Uint8Array,
    slot: number,
    blockTime: number,
    address: Uint8Array
  ): Promise<void> {
    await this.trie.set(address, signature, { slot, blockTime });
  }
}