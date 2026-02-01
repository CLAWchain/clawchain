import { Block } from './block';
import { BlockPropagator } from '../networking/block_propagator';
import { PeerManager } from '../networking/peer_manager';
import { AccountStorage } from '../AccountStorage';
import { ContractStorage } from '../contracts/ContractStorage';
import { zlib } from 'zlib';
import { fs } from 'fs';
import { path } from 'path';

export class Blockchain {
  private blocks: Block[] = [];
  private uncleBlocks: Block[] = [];
  private blockPropagator: BlockPropagator;
  private accountStorage: AccountStorage;
  private contractStorage: ContractStorage;
  private snapshotInterval: number = 60 * 60 * 1000; // 1 hour
  private snapshotPath: string = 'data/snapshots';

  constructor(peerManager: PeerManager, accountStorage: AccountStorage, contractStorage: ContractStorage) {
    this.blockPropagator = new BlockPropagator(peerManager);
    this.accountStorage = accountStorage;
    this.contractStorage = contractStorage;
    this.startSnapshotTimer();
  }

  addBlock(block: Block) {
    // Check if the block is an uncle/ommer block
    if (this.isUncleBlock(block)) {
      // Apply partial reward to the miner
      this.applyUncleReward(block);
      this.uncleBlocks.push(block);
    } else {
      // Add the block to the main chain
      this.blocks.push(block);
      this.blockPropagator.propagateBlock(block);
      this.updateStateFromBlock(block);
      this.maybeCreateSnapshot();
    }
  }

  // ... other methods ...

  takeStateSnapshot(): Uint8Array {
    // Serialize the current state of the blockchain
    const accountState = this.accountStorage.serialize();
    const contractState = this.contractStorage.serialize();
    const snapshotData = new Uint8Array([...accountState, ...contractState]);

    // Compress the snapshot data
    return zlib.deflateSync(snapshotData);
  }

  loadStateFromSnapshot(snapshotData: Uint8Array) {
    // Decompress the snapshot data
    const decompressedData = zlib.inflateSync(snapshotData);

    // Deserialize the account and contract states
    const accountState = decompressedData.slice(0, this.accountStorage.serializedSize());
    const contractState = decompressedData.slice(this.accountStorage.serializedSize());
    this.accountStorage.deserialize(accountState);
    this.contractStorage.deserialize(contractState);
  }

  loadLatestStateSnapshot(): boolean {
    const latestSnapshot = this.findLatestSnapshot();
    if (latestSnapshot) {
      const snapshotData = fs.readFileSync(latestSnapshot);
      this.loadStateFromSnapshot(snapshotData);
      return true;
    }
    return false;
  }

  private startSnapshotTimer() {
    setInterval(() => {
      this.maybeCreateSnapshot();
    }, this.snapshotInterval);
  }

  private maybeCreateSnapshot() {
    // Check if it's time to create a new snapshot
    if (this.blocks.length % 100 === 0) {
      const snapshotData = this.takeStateSnapshot();
      this.saveSnapshot(snapshotData);
    }
  }

  private saveSnapshot(snapshotData: Uint8Array) {
    // Create the snapshot directory if it doesn't exist
    if (!fs.existsSync(this.snapshotPath)) {
      fs.mkdirSync(this.snapshotPath, { recursive: true });
    }

    // Save the snapshot to a file
    const snapshotFilePath = path.join(this.snapshotPath, `snapshot_${Date.now()}.dat`);
    fs.writeFileSync(snapshotFilePath, snapshotData);
  }

  private findLatestSnapshot(): string | null {
    // Scan the snapshot directory and find the latest snapshot file
    const files = fs.readdirSync(this.snapshotPath);
    const snapshotFiles = files.filter(file => file.endsWith('.dat'));
    if (snapshotFiles.length === 0) {
      return null;
    }
    snapshotFiles.sort((a, b) => {
      const aTime = parseInt(a.split('_')[1].replace('.dat', ''));
      const bTime = parseInt(b.split('_')[1].replace('.dat', ''));
      return bTime - aTime;
    });
    return path.join(this.snapshotPath, snapshotFiles[0]);
  }
}