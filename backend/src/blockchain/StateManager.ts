import crypto from 'crypto';
import { db, cache } from '../database/db';
import { Transaction, generateHash } from './Block';
import { eventBus } from '../events/EventBus';

// Account state structure
export interface AccountState {
  address: string;
  balance: bigint;
  nonce: number;
  codeHash?: string;  // For contract accounts
  storageRoot?: string;
}

// State change for tracking
export interface StateChange {
  address: string;
  previousBalance: bigint;
  newBalance: bigint;
  previousNonce: number;
  newNonce: number;
  blockHeight: number;
  txHash?: string;
}

// Merkle tree node for state root calculation
interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  data?: string;
}

// Initial token supply and distribution
const INITIAL_SUPPLY = BigInt('1000000000000000000000000'); // 1 million CLAW (with 18 decimals)
const GENESIS_ADDRESS = 'CLAWGenesis1111111111111111111111111111111';
const FAUCET_ADDRESS = 'CLAWCHAIN_FAUCET';
const TREASURY_ADDRESS = 'CLAWTreasury11111111111111111111111111111';

export class StateManager {
  private accounts: Map<string, AccountState> = new Map();
  private stateRoot: string = '';
  private initialized: boolean = false;
  private stateChanges: StateChange[] = [];

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create accounts table if not exists
      await db.query(`
        CREATE TABLE IF NOT EXISTS account_state (
          address VARCHAR(64) PRIMARY KEY,
          balance VARCHAR(78) NOT NULL DEFAULT '0',
          nonce INTEGER NOT NULL DEFAULT 0,
          code_hash VARCHAR(64),
          storage_root VARCHAR(64),
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create state changes history table
      await db.query(`
        CREATE TABLE IF NOT EXISTS state_changes (
          id SERIAL PRIMARY KEY,
          address VARCHAR(64) NOT NULL,
          previous_balance VARCHAR(78) NOT NULL,
          new_balance VARCHAR(78) NOT NULL,
          previous_nonce INTEGER NOT NULL,
          new_nonce INTEGER NOT NULL,
          block_height INTEGER NOT NULL,
          tx_hash VARCHAR(64),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Load existing accounts from database
      const result = await db.query('SELECT * FROM account_state');
      for (const row of result.rows) {
        this.accounts.set(row.address, {
          address: row.address,
          balance: BigInt(row.balance),
          nonce: row.nonce,
          codeHash: row.code_hash,
          storageRoot: row.storage_root
        });
      }

      // Initialize genesis accounts if empty
      if (this.accounts.size === 0) {
        await this.initializeGenesisState();
      }

      // Calculate initial state root
      this.stateRoot = this.calculateStateRoot();
      this.initialized = true;

      console.log(`[STATE] StateManager initialized with ${this.accounts.size} accounts`);
      console.log(`[STATE] Current state root: ${this.stateRoot.substring(0, 20)}...`);
      console.log(`[STATE] Faucet balance: ${this.formatBalance(this.getBalance(FAUCET_ADDRESS))} CLAW`);

    } catch (error) {
      console.error('[STATE] Initialization error:', error);
      // Fallback to in-memory state
      await this.initializeGenesisState();
      this.stateRoot = this.calculateStateRoot();
      this.initialized = true;
    }
  }

  private async initializeGenesisState(): Promise<void> {
    // Genesis distribution
    const distributions: { address: string; balance: bigint }[] = [
      { address: GENESIS_ADDRESS, balance: INITIAL_SUPPLY / 10n }, // 10% to genesis
      { address: FAUCET_ADDRESS, balance: INITIAL_SUPPLY / 2n },   // 50% to faucet
      { address: TREASURY_ADDRESS, balance: INITIAL_SUPPLY * 4n / 10n } // 40% to treasury
    ];

    for (const { address, balance } of distributions) {
      const account: AccountState = {
        address,
        balance,
        nonce: 0
      };
      this.accounts.set(address, account);

      try {
        await db.query(`
          INSERT INTO account_state (address, balance, nonce)
          VALUES ($1, $2, $3)
          ON CONFLICT (address) DO UPDATE SET balance = $2
        `, [address, balance.toString(), 0]);
      } catch (e) {
        // Ignore DB errors in fallback mode
      }
    }

    console.log('[STATE] Genesis state initialized with initial token distribution');
  }

  // Get account balance
  getBalance(address: string): bigint {
    return this.accounts.get(address)?.balance ?? 0n;
  }

  // Get account nonce
  getNonce(address: string): number {
    return this.accounts.get(address)?.nonce ?? 0;
  }

  // Get full account state
  getAccount(address: string): AccountState | undefined {
    return this.accounts.get(address);
  }

  // Get current state root
  getStateRoot(): string {
    return this.stateRoot;
  }

  // Apply a transaction to state
  async applyTransaction(tx: Transaction, blockHeight: number): Promise<boolean> {
    const fromAccount = this.accounts.get(tx.from) || {
      address: tx.from,
      balance: 0n,
      nonce: 0
    };

    const toAccount = this.accounts.get(tx.to) || {
      address: tx.to,
      balance: 0n,
      nonce: 0
    };

    // Calculate total cost (value + gas)
    const gasCost = tx.gasPrice * tx.gasLimit;
    const totalCost = tx.value + gasCost;

    // Check if sender can afford transaction
    if (fromAccount.balance < totalCost) {
      console.log(`[STATE] Insufficient balance: ${tx.from.substring(0, 12)}... has ${fromAccount.balance}, needs ${totalCost}`);
      return false;
    }

    // Check nonce
    if (tx.nonce !== fromAccount.nonce) {
      console.log(`[STATE] Invalid nonce: expected ${fromAccount.nonce}, got ${tx.nonce}`);
      return false;
    }

    // Record state changes
    const fromChange: StateChange = {
      address: tx.from,
      previousBalance: fromAccount.balance,
      newBalance: fromAccount.balance - totalCost,
      previousNonce: fromAccount.nonce,
      newNonce: fromAccount.nonce + 1,
      blockHeight,
      txHash: tx.hash
    };

    const toChange: StateChange = {
      address: tx.to,
      previousBalance: toAccount.balance,
      newBalance: toAccount.balance + tx.value,
      previousNonce: toAccount.nonce,
      newNonce: toAccount.nonce,
      blockHeight,
      txHash: tx.hash
    };

    // Apply changes
    fromAccount.balance -= totalCost;
    fromAccount.nonce += 1;
    toAccount.balance += tx.value;

    this.accounts.set(tx.from, fromAccount);
    this.accounts.set(tx.to, toAccount);
    this.stateChanges.push(fromChange, toChange);

    // Persist to database
    await this.persistAccountState(fromAccount);
    await this.persistAccountState(toAccount);
    await this.persistStateChange(fromChange);
    await this.persistStateChange(toChange);

    // Emit event for live streaming
    eventBus.emit('state_change', {
      type: 'transfer',
      from: tx.from,
      to: tx.to,
      value: tx.value.toString(),
      fromNewBalance: fromAccount.balance.toString(),
      toNewBalance: toAccount.balance.toString(),
      blockHeight
    });

    return true;
  }

  // Apply block reward
  async applyBlockReward(producer: string, blockHeight: number, reward: bigint = 10n * 10n**18n): Promise<void> {
    const account = this.accounts.get(producer) || {
      address: producer,
      balance: 0n,
      nonce: 0
    };

    const change: StateChange = {
      address: producer,
      previousBalance: account.balance,
      newBalance: account.balance + reward,
      previousNonce: account.nonce,
      newNonce: account.nonce,
      blockHeight
    };

    account.balance += reward;
    this.accounts.set(producer, account);
    this.stateChanges.push(change);

    await this.persistAccountState(account);
    await this.persistStateChange(change);

    eventBus.emit('state_change', {
      type: 'block_reward',
      producer,
      reward: reward.toString(),
      newBalance: account.balance.toString(),
      blockHeight
    });
  }

  // Process faucet request
  async processFaucetRequest(toAddress: string, amount: bigint, blockHeight: number): Promise<boolean> {
    const faucetAccount = this.accounts.get(FAUCET_ADDRESS);
    if (!faucetAccount || faucetAccount.balance < amount) {
      console.log('[STATE] Faucet has insufficient funds');
      return false;
    }

    const toAccount = this.accounts.get(toAddress) || {
      address: toAddress,
      balance: 0n,
      nonce: 0
    };

    // Record changes
    const faucetChange: StateChange = {
      address: FAUCET_ADDRESS,
      previousBalance: faucetAccount.balance,
      newBalance: faucetAccount.balance - amount,
      previousNonce: faucetAccount.nonce,
      newNonce: faucetAccount.nonce + 1,
      blockHeight
    };

    const toChange: StateChange = {
      address: toAddress,
      previousBalance: toAccount.balance,
      newBalance: toAccount.balance + amount,
      previousNonce: toAccount.nonce,
      newNonce: toAccount.nonce,
      blockHeight
    };

    // Apply
    faucetAccount.balance -= amount;
    faucetAccount.nonce += 1;
    toAccount.balance += amount;

    this.accounts.set(FAUCET_ADDRESS, faucetAccount);
    this.accounts.set(toAddress, toAccount);
    this.stateChanges.push(faucetChange, toChange);

    await this.persistAccountState(faucetAccount);
    await this.persistAccountState(toAccount);
    await this.persistStateChange(faucetChange);
    await this.persistStateChange(toChange);

    eventBus.emit('state_change', {
      type: 'faucet',
      from: FAUCET_ADDRESS,
      to: toAddress,
      amount: amount.toString(),
      faucetRemaining: faucetAccount.balance.toString(),
      blockHeight
    });

    return true;
  }

  // Calculate new state root after changes
  calculateStateRoot(): string {
    const accountHashes: string[] = [];
    
    // Sort accounts by address for deterministic ordering
    const sortedAccounts = Array.from(this.accounts.entries())
      .sort(([a], [b]) => a.localeCompare(b));

    for (const [address, account] of sortedAccounts) {
      const accountData = JSON.stringify({
        address,
        balance: account.balance.toString(),
        nonce: account.nonce,
        codeHash: account.codeHash || '',
        storageRoot: account.storageRoot || ''
      });
      accountHashes.push(generateHash(accountData));
    }

    // Build Merkle tree
    if (accountHashes.length === 0) {
      return generateHash('empty_state');
    }

    return this.buildMerkleRoot(accountHashes);
  }

  private buildMerkleRoot(hashes: string[]): string {
    if (hashes.length === 1) return hashes[0];

    const nextLevel: string[] = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = hashes[i + 1] || left;
      nextLevel.push(generateHash(left + right));
    }

    return this.buildMerkleRoot(nextLevel);
  }

  // Commit state changes and update root
  async commitBlock(blockHeight: number): Promise<string> {
    this.stateRoot = this.calculateStateRoot();
    
    // Clear pending changes
    this.stateChanges = [];

    // Cache the new state root
    try {
      await cache.set(`state_root:${blockHeight}`, this.stateRoot);
      await cache.set('current_state_root', this.stateRoot);
    } catch (e) {
      // Ignore cache errors
    }

    console.log(`[STATE] Block ${blockHeight} committed, state root: ${this.stateRoot.substring(0, 20)}...`);
    return this.stateRoot;
  }

  // Get recent state changes for display
  getRecentStateChanges(limit: number = 10): StateChange[] {
    return this.stateChanges.slice(-limit);
  }

  // Get all accounts summary
  getAccountsSummary(): { address: string; balance: string; nonce: number }[] {
    return Array.from(this.accounts.values())
      .map(acc => ({
        address: acc.address,
        balance: this.formatBalance(acc.balance),
        nonce: acc.nonce
      }))
      .sort((a, b) => {
        const balA = BigInt(a.balance.replace(' CLAW', '').replace(/,/g, ''));
        const balB = BigInt(b.balance.replace(' CLAW', '').replace(/,/g, ''));
        return balB > balA ? 1 : -1;
      });
  }

  // Get total supply
  getTotalSupply(): bigint {
    return INITIAL_SUPPLY;
  }

  // Get circulating supply (total - treasury - faucet)
  getCirculatingSupply(): bigint {
    const treasuryBalance = this.getBalance(TREASURY_ADDRESS);
    const faucetBalance = this.getBalance(FAUCET_ADDRESS);
    return INITIAL_SUPPLY - treasuryBalance - faucetBalance;
  }

  // Format balance for display
  formatBalance(balance: bigint): string {
    const wholePart = balance / (10n ** 18n);
    return `${wholePart.toLocaleString()} CLAW`;
  }

  // Persist account state to database
  private async persistAccountState(account: AccountState): Promise<void> {
    try {
      await db.query(`
        INSERT INTO account_state (address, balance, nonce, code_hash, storage_root, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (address) DO UPDATE SET
          balance = $2,
          nonce = $3,
          code_hash = $4,
          storage_root = $5,
          updated_at = NOW()
      `, [
        account.address,
        account.balance.toString(),
        account.nonce,
        account.codeHash || null,
        account.storageRoot || null
      ]);
    } catch (error) {
      console.error('[STATE] Error persisting account:', error);
    }
  }

  // Persist state change to history
  private async persistStateChange(change: StateChange): Promise<void> {
    try {
      await db.query(`
        INSERT INTO state_changes (
          address, previous_balance, new_balance, previous_nonce, new_nonce, block_height, tx_hash
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        change.address,
        change.previousBalance.toString(),
        change.newBalance.toString(),
        change.previousNonce,
        change.newNonce,
        change.blockHeight,
        change.txHash || null
      ]);
    } catch (error) {
      // Ignore history logging errors
    }
  }
}

// Export singleton instance
export const stateManager = new StateManager();
