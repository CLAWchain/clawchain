import { BlockHeader } from '../chain/block';
import { AccountState } from '../state/account';
import { ContractState } from '../state/contract';
import { getAccountStates, getContractStates } from '../state/repository';
import { createSnapshotFile, loadLatestSnapshotFile } from './snapshot_storage';

export interface StateSnapshot {
  blockHeight: number;
  timestamp: number;
  hash: string;
  accounts: Record<string, AccountState>;
  contracts: Record<string, ContractState>;
}

export class SnapshotManager {
  private snapshotDir = 'data/snapshots';

  async createSnapshot(blockHeader: BlockHeader): Promise<StateSnapshot> {
    // Capture current state
    const accounts = await this.getAllAccountStates();
    const contracts = await this.getAllContractStates();

    // Create snapshot object
    const snapshot: StateSnapshot = {
      blockHeight: blockHeader.height,
      timestamp: blockHeader.timestamp,
      hash: blockHeader.hash,
      accounts,
      contracts
    };

    // Compress and store snapshot
    await this.storeSnapshot(snapshot);

    return snapshot;
  }

  private async getAllAccountStates(): Promise<Record<string, AccountState>> {
    return await getAccountStates();
  }

  private async getAllContractStates(): Promise<Record<string, ContractState>> {
    return await getContractStates();
  }

  private async storeSnapshot(snapshot: StateSnapshot): Promise<void> {
    await createSnapshotFile(this.snapshotDir, snapshot);
  }

  async loadLatestSnapshot(): Promise<StateSnapshot | null> {
    return await loadLatestSnapshotFile(this.snapshotDir);
  }
}