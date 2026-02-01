import { StateManager, AccountState, StateChange } from './StateManager';
import { db } from '../database/db';
import { eventBus } from '../events/EventBus';
import { generateHash } from './Block';

export class StateManagerExtension extends StateManager {
  private stateLock = new ReadWriteLock();
  private stateRoot: string = '';
  private lastStateUpdate: number = 0;

  async initialize(): Promise<void> {
    await super.initialize();
    this.stateRoot = this.calculateStateRoot();
    this.lastStateUpdate = Date.now();
  }

  async applyTransaction(tx: Transaction, blockHeight: number): Promise<boolean> {
    await this.stateLock.acquireWriteLock();
    try {
      const success = await super.applyTransaction(tx, blockHeight);
      this.stateRoot = this.calculateStateRoot();
      this.lastStateUpdate = Date.now();
      return success;
    } finally {
      this.stateLock.releaseWriteLock();
    }
  }

  async applyBlockReward(producer: string, blockHeight: number, reward: bigint = 10n * 10n**18n): Promise<void> {
    await this.stateLock.acquireWriteLock();
    try {
      await super.applyBlockReward(producer, blockHeight, reward);
      this.stateRoot = this.calculateStateRoot();
      this.lastStateUpdate = Date.now();
    } finally {
      this.stateLock.releaseWriteLock();
    }
  }

  async processFaucetRequest(toAddress: string, amount: bigint, blockHeight: number): Promise<boolean> {
    await this.stateLock.acquireWriteLock();
    try {
      const success = await super.processFaucetRequest(toAddress, amount, blockHeight);
      this.stateRoot = this.calculateStateRoot();
      this.lastStateUpdate = Date.now();
      return success;
    } finally {
      this.stateLock.releaseWriteLock();
    }
  }

  getStateRoot(): string {
    await this.stateLock.acquireReadLock();
    try {
      if (Date.now() - this.lastStateUpdate > 5000) {
        this.stateRoot = this.calculateStateRoot();
        this.lastStateUpdate = Date.now();
      }
      return this.stateRoot;
    } finally {
      this.stateLock.releaseReadLock();
    }
  }

  private async persistAccountState(account: AccountState): Promise<void> {
    await db.transaction(async (client) => {
      await client.query(`
        INSERT INTO account_state (address, balance, nonce, code_hash, storage_root)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (address) DO UPDATE SET balance = $2, nonce = $3, code_hash = $4, storage_root = $5
      `, [
        account.address,
        account.balance.toString(),
        account.nonce,
        account.codeHash,
        account.storageRoot
      ]);
    });
  }

  private async persistStateChange(change: StateChange): Promise<void> {
    await db.transaction(async (client) => {
      await client.query(`
        INSERT INTO state_changes (address, previous_balance, new_balance, previous_nonce, new_nonce, block_height, tx_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        change.address,
        change.previousBalance.toString(),
        change.newBalance.toString(),
        change.previousNonce,
        change.newNonce,
        change.blockHeight,
        change.txHash
      ]);
    });
  }

  private calculateStateRoot(): string {
    const accountHashes: string[] = [];
    
    // Sort accounts by address for deterministic order
    const sortedAccounts = Array.from(this.accounts.values()).sort((a, b) => a.address.localeCompare(b.address));

    for (const account of sortedAccounts) {
      const accountHash = generateHash(`${account.address}:${account.balance.toString()}:${account.nonce}:${account.codeHash || ''}:${account.storageRoot || ''}`);
      accountHashes.push(accountHash);
    }

    return generateHash(accountHashes.join(''));
  }
}

class ReadWriteLock {
  private readCount: number = 0;
  private writeLocked: boolean = false;
  private waitingWriters: number = 0;

  async acquireReadLock(): Promise<void> {
    while (this.writeLocked || this.waitingWriters > 0) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    this.readCount++;
  }

  releaseReadLock(): void {
    this.readCount--;
  }

  async acquireWriteLock(): Promise<void> {
    this.waitingWriters++;
    while (this.readCount > 0 || this.writeLocked) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    this.waitingWriters--;
    this.writeLocked = true;
  }

  releaseWriteLock(): void {
    this.writeLocked = false;
  }
}