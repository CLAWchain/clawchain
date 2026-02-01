import { PrivateKey, PublicKey } from '../crypto';

export class AccountStorage {
  private storage: Map<string, Map<string, any>>;
  private archivedCheckpoints: Map<number, Map<string, Map<string, any>>>;
  private pruningInterval: number = 60000; // 1 minute

  constructor() {
    this.storage = new Map();
    this.archivedCheckpoints = new Map();

    // Start the pruning process
    this.startPruningProcess();
  }

  getAccount(publicKey: PublicKey): Map<string, any> {
    const accountKey = publicKey.toString();
    if (!this.storage.has(accountKey)) {
      this.storage.set(accountKey, new Map());
    }
    return this.storage.get(accountKey)!;
  }

  setAccountState(publicKey: PublicKey, key: string, value: any): void {
    const account = this.getAccount(publicKey);
    account.set(key, value);
  }

  getAccountState(publicKey: PublicKey, key: string): any {
    const account = this.getAccount(publicKey);
    return account.get(key);
  }

  private startPruningProcess(): void {
    setInterval(() => {
      this.pruneOldState();
    }, this.pruningInterval);
  }

  private pruneOldState(): void {
    // Get the current block height
    const currentBlockHeight = this.getCurrentBlockHeight();

    // Prune state data older than 100 blocks
    const pruneBlockHeight = currentBlockHeight - 100;

    // Archive the current state as a checkpoint
    this.archiveStateCheckpoint(pruneBlockHeight);

    // Remove old state data from the in-memory storage
    this.storage.forEach((accountState, accountKey) => {
      accountState.forEach((value, key) => {
        if (this.getStateBlockHeight(accountKey, key) < pruneBlockHeight) {
          accountState.delete(key);
        }
      });
      if (accountState.size === 0) {
        this.storage.delete(accountKey);
      }
    });

    // Clean up old archived checkpoints
    this.archivedCheckpoints.forEach((checkpoint, blockHeight) => {
      if (blockHeight < pruneBlockHeight) {
        this.archivedCheckpoints.delete(blockHeight);
      }
    });

    console.log(`Pruned state data up to block height ${pruneBlockHeight}`);
  }

  private archiveStateCheckpoint(blockHeight: number): void {
    const checkpoint = new Map<string, Map<string, any>>();
    this.storage.forEach((accountState, accountKey) => {
      const archivedAccountState = new Map<string, any>(accountState);
      checkpoint.set(accountKey, archivedAccountState);
    });
    this.archivedCheckpoints.set(blockHeight, checkpoint);
  }

  private getStateBlockHeight(accountKey: string, stateKey: string): number {
    // Implement logic to retrieve the block height associated with a specific state entry
    // This could be stored as metadata in the state data or in a separate index
    return 0;
  }

  private getCurrentBlockHeight(): number {
    // Implement logic to retrieve the current block height
    // This could involve querying the blockchain or maintaining a local block height tracker
    return 0;
  }
}