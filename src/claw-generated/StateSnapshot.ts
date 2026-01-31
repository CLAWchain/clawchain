import { MerklePatriciaTrie } from './Trie';
import { Account } from './account';

export class StateSnapshot {
  private trie: MerklePatriciaTrie<Account>;
  private stateRoot: Buffer;
  private blockHeight: number;

  constructor(trie: MerklePatriciaTrie<Account>, stateRoot: Buffer, blockHeight: number) {
    this.trie = trie;
    this.stateRoot = stateRoot;
    this.blockHeight = blockHeight;
  }

  getAccount(address: Buffer): Account {
    return this.trie.get(address);
  }

  getStateRoot(): Buffer {
    return this.stateRoot;
  }

  getBlockHeight(): number {
    return this.blockHeight;
  }
}