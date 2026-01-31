import { MerklePatriciaTrie } from './merkle-patricia-trie';
import { compress, decompress } from './compression';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

export class StateSnapshot {
  private trie: MerklePatriciaTrie;
  private snapshotInterval: number;
  private snapshotDir: string;

  constructor(snapshotInterval: number, snapshotDir: string) {
    this.trie = new MerklePatriciaTrie();
    this.snapshotInterval = snapshotInterval;
    this.snapshotDir = snapshotDir;
  }

  async takeSnapshot(): Promise<void> {
    const snapshotHash = await this.trie.getRootHash();
    const snapshotData = await this.trie.serialize();
    const compressedData = await compress(snapshotData);
    await writeFile(join(this.snapshotDir, `snapshot-${snapshotHash}.dat`), compressedData);
  }

  async loadSnapshot(hash: string): Promise<void> {
    const snapshotPath = join(this.snapshotDir, `snapshot-${hash}.dat`);
    const compressedData = await readFile(snapshotPath);
    const snapshotData = await decompress(compressedData);
    await this.trie.deserialize(snapshotData);
  }
}