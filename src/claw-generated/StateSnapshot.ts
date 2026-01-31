import { MerklePatriciaTrie } from '../trie/MerklePatriciaTrie';
import { Account } from '../account/Account';
import { Block } from '../block/Block';
import { Checkpoint } from './Checkpoint';
import { LZ4 } from 'lz4-wasm';

export class StateSnapshot {
  private trie: MerklePatriciaTrie;
  private blocks: Block[];
  private accounts: Map<string, Account>;
  private checkpoints: Checkpoint[];

  constructor() {
    this.trie = new MerklePatriciaTrie();
    this.blocks = [];
    this.accounts = new Map();
    this.checkpoints = [];
  }

  /**
   * Capture the current state of the blockchain.
   */
  captureState(block: Block): void {
    this.blocks.push(block);
    block.transactions.forEach((tx) => {
      this.trie.put(tx.from, this.accounts.get(tx.from) || new Account());
      this.trie.put(tx.to, this.accounts.get(tx.to) || new Account());
    });
    this.checkpoints.push(new Checkpoint(block.number, this.trie.root));
  }

  /**
   * Load a state snapshot and apply it to the current state.
   */
  loadSnapshot(checkpoint: Checkpoint): void {
    this.trie.load(checkpoint.root);
    this.blocks = this.blocks.filter((b) => b.number >= checkpoint.blockNumber);
  }

  /**
   * Compress the state snapshot for efficient storage.
   */
  async compressSnapshot(): Promise<Uint8Array> {
    const snapshotData = {
      trie: this.trie.serialize(),
      blocks: this.blocks,
      accounts: Array.from(this.accounts.values()),
      checkpoints: this.checkpoints,
    };

    const serializedData = JSON.stringify(snapshotData);
    const compressedData = await LZ4.compress(serializedData);
    return compressedData;
  }

  /**
   * Decompress a stored state snapshot.
   */
  async decompressSnapshot(compressed: Uint8Array): Promise<void> {
    const decompressedData = await LZ4.decompress(compressed);
    const snapshotData = JSON.parse(decompressedData);

    this.trie.deserialize(snapshotData.trie);
    this.blocks = snapshotData.blocks;
    this.accounts = new Map(snapshotData.accounts.map((acc) => [acc.address, acc]));
    this.checkpoints = snapshotData.checkpoints;
  }
}