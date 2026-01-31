import { StateSnapshot } from './snapshot';
import { createGzip } from 'zlib';
import { createWriteStream, readdir, readFile } from 'fs/promises';
import { join } from 'path';

export async function createSnapshotFile(snapshotDir: string, snapshot: StateSnapshot): Promise<void> {
  const snapshotPath = join(snapshotDir, `${snapshot.blockHeight}.snapshot`);
  const gzip = createGzip();
  const writeStream = createWriteStream(snapshotPath);

  writeStream.write(JSON.stringify(snapshot));
  writeStream.pipe(gzip).pipe(writeStream);
  await new Promise((resolve) => writeStream.on('finish', resolve));
}

export async function loadLatestSnapshotFile(snapshotDir: string): Promise<StateSnapshot | null> {
  const files = await readdir(snapshotDir);
  if (files.length === 0) {
    return null;
  }

  // Find the latest snapshot file
  const latestFile = files.reduce((latest, file) => {
    const height = parseInt(file.split('.')[0]);
    return height > parseInt(latest.split('.')[0]) ? file : latest;
  }, '');

  const snapshotPath = join(snapshotDir, latestFile);
  const snapshotData = await readFile(snapshotPath);
  const snapshot = JSON.parse(snapshotData.toString()) as StateSnapshot;
  return snapshot;
}