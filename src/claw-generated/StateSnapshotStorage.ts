import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

class StateSnapshotStorage {
  private snapshotDir = 'state-snapshots';

  async storeSnapshot(snapshotData: Uint8Array): Promise<void> {
    const filename = `snapshot-${Date.now()}.bin`;
    const filePath = join(this.snapshotDir, filename);
    await writeFile(filePath, snapshotData);
    console.log(`Stored state snapshot to ${filePath}`);
  }

  async loadLatestSnapshot(): Promise<Uint8Array | null> {
    const files = await this.listSnapshotFiles();
    if (files.length === 0) {
      return null;
    }

    const latestFile = files[files.length - 1];
    const filePath = join(this.snapshotDir, latestFile);
    const snapshotData = await readFile(filePath);
    return snapshotData;
  }

  private async listSnapshotFiles(): Promise<string[]> {
    try {
      const files = await readdir(this.snapshotDir);
      return files.filter((file) => file.startsWith('snapshot-') && file.endsWith('.bin'));
    } catch (err) {
      console.error('Error listing snapshot files:', err);
      return [];
    }
  }
}

export { StateSnapshotStorage };