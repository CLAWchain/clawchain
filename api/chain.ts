import express from 'express';
import { gipSystem } from './gip-system';

// Realistic blockchain simulation for Vercel
export class Chain {
  private accounts: Map<string, number> = new Map();
  private blocks: any[] = [];
  private transactions: any[] = [];
  private currentSlot = 0; // Start at 0 like local version
  private currentEpoch = 1;
  private slotsPerEpoch = 432000; // Solana-like: ~432k slots per epoch
  private validators = ['alice', 'ayra', 'jarvis', 'cortana', 'lumina', 'nix'];
  private validatorStats: { [key: string]: { produced: number; missed: number; totalSlots: number } } = {};
  private lastUpdateTime = Date.now();
  private slotInterval = 400; // 400ms per slot (Solana-like)
  private lastSlotUpdate = Date.now();
  
  constructor() {
    this.initializeChain();
    // Don't start slot progression in serverless environment
    // Slots will be updated on-demand when API is called
  }

  private initializeChain() {
    // Initialize accounts with some balance
    for (let i = 0; i < 20; i++) {
      const address = this.generateAddress();
      this.accounts.set(address, Math.floor(Math.random() * 1000) + 100);
    }

    // Initialize validator stats with realistic values
    this.validators.forEach(validator => {
      this.validatorStats[validator] = { 
        produced: Math.floor(Math.random() * 50000) + 10000,
        missed: Math.floor(Math.random() * 1000) + 100,
        totalSlots: Math.floor(Math.random() * 100000) + 50000
      };
    });
    
    // Generate initial blocks
    for (let i = 0; i < 50; i++) {
      this.generateBlock();
    }

    // Generate initial transactions
    for (let i = 0; i < 100; i++) {
      this.generateTransaction();
    }
  }



  private updateValidatorStats() {
    this.validators.forEach(validator => {
      const stats = this.validatorStats[validator];
      // Simulate realistic validator performance
      if (Math.random() < 0.95) { // 95% success rate
        stats.produced++;
      } else {
        stats.missed++;
      }
      stats.totalSlots++;
    });
  }

  private generateAddress(): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateBlock() {
    const height = this.blocks.length + 1;
    const producer = this.validators[Math.floor(Math.random() * this.validators.length)];
    const block = {
      height,
      producer,
      timestamp: Date.now() - Math.random() * 86400000, // Random time in last 24 hours
      transactions: this.transactions.slice(-Math.floor(Math.random() * 10) + 1),
      hash: this.generateHash(),
      slot: this.currentSlot + height
    };
    this.blocks.push(block);
  }

  private generateTransaction() {
    const addresses = Array.from(this.accounts.keys());
    const from = addresses[Math.floor(Math.random() * addresses.length)];
    const to = addresses[Math.floor(Math.random() * addresses.length)];
    const amount = Math.floor(Math.random() * 100) + 1;
    
    const tx = {
      from, 
      to, 
      amount, 
      timestamp: Date.now() - Math.random() * 86400000,
      hash: this.generateHash(),
      fee: Math.floor(Math.random() * 5) + 1
    };
    this.transactions.push(tx);
  }

  private generateHash(): string {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Public methods
  getAccounts() {
    return Array.from(this.accounts.entries()).map(([address, balance]) => ({
      address,
      balance
    }));
  }

  getBlocks() {
    return this.blocks.slice(-50); // Return last 50 blocks
  }

  getTransactions() {
    return this.transactions.slice(-100); // Return last 100 transactions
  }

  private updateSlotsOnDemand() {
    const now = Date.now();
    const timeDiff = now - this.lastSlotUpdate;
    const slotsToAdd = Math.floor(timeDiff / this.slotInterval);
    
    if (slotsToAdd > 0) {
      // Increment slot by 1 each time, like local version
      this.currentSlot += 1;
      this.lastSlotUpdate = now;
      
      // Generate new blocks and transactions
      this.generateBlock();
      if (Math.random() < 0.3) { // 30% chance of transaction per slot
        this.generateTransaction();
      }
      
      // Update validator stats
      this.updateValidatorStats();
      
      // Trigger debate message release every 60 slots (approximately every 24 seconds)
      if (this.currentSlot % 60 === 0) {
        const status = gipSystem.getCurrentDebateStatus();
        if (status.currentGIP) {
          gipSystem.startGradualMessageRelease(status.currentGIP);
        }
      }
      
      // Check for epoch transition
      if (this.currentSlot >= this.slotsPerEpoch) {
        this.nextEpoch();
      }
    }
  }

  getEpoch() {
    this.updateSlotsOnDemand(); // Update slots before returning
    return {
      epoch: this.currentEpoch,
      slot: this.currentSlot,
      nextEpochAt: this.slotsPerEpoch
    };
  }

  getValidators() {
    return {
      validators: this.validators,
      stats: this.validatorStats
    };
  }

  getPendingTransactions() {
    return this.transactions.slice(-10); // Return last 10 as pending
  }

  createAccount(address: string) {
    if (!this.accounts.has(address)) {
      this.accounts.set(address, 0);
      return { success: true, address, balance: 0 };
    }
    return { success: false, error: 'Account already exists' };
  }

  sendTransaction(from: string, to: string, amount: number) {
    const fromBalance = this.accounts.get(from) || 0;
    if (fromBalance < amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    this.accounts.set(from, fromBalance - amount);
    this.accounts.set(to, (this.accounts.get(to) || 0) + amount);

    const tx = {
      from,
      to,
      amount,
      timestamp: Date.now(),
      hash: this.generateHash(),
      fee: 1
    };
    this.transactions.push(tx);

    return { success: true, transaction: tx };
  }

  faucet(address: string, amount: number, faucetLimits: Record<string, number>) {
    const now = Date.now();
    
    // Check if account exists
    if (!this.accounts.has(address)) {
      return { success: false, error: 'Account does not exist' };
    }
    
    // Check cooldown (30 seconds)
    if (!faucetLimits[address] || (now - faucetLimits[address]) > 30000) {
      const currentBalance = this.accounts.get(address) || 0;
      this.accounts.set(address, currentBalance + amount);
      faucetLimits[address] = now;

      const tx = {
        from: 'faucet',
        to: address,
        amount,
        timestamp: now,
        hash: this.generateHash(),
        fee: 0
      };
      this.transactions.push(tx);

      return { success: true, transaction: tx };
    } else {
      return { success: false, error: 'Faucet cooldown: try again later' };
    }
  }

  generateWallet() {
    const address = this.generateAddress();
    
    // Create the account using the existing createAccount method
    const result = this.createAccount(address);
    
    if (result.success) {
      return { wallet: address };
    } else {
      // If account already exists, generate a new one
      return this.generateWallet();
    }
  }

  // Get current slot for real-time updates
  getCurrentSlot() {
    this.updateSlotsOnDemand(); // Update slots before returning
    return this.currentSlot;
  }

  // Get blockchain status
  getStatus() {
    this.updateSlotsOnDemand(); // Update slots before returning
    return {
      currentSlot: this.currentSlot,
      currentEpoch: this.currentEpoch,
      totalBlocks: this.blocks.length,
      totalTransactions: this.transactions.length,
      activeValidators: this.validators.length,
      lastUpdate: this.lastUpdateTime
    };
  }
  
  // Next epoch method like local version
  private nextEpoch() {
    this.currentEpoch++;
    this.currentSlot = 0;
    console.log(`Epoch ${this.currentEpoch} started!`);
    
    // Update stats for new epoch (realistic)
    for (const v of Object.keys(this.validatorStats)) {
      const currentStats = this.validatorStats[v];
      this.validatorStats[v] = { 
        produced: currentStats.produced, 
        missed: currentStats.missed,
        totalSlots: currentStats.totalSlots + Math.floor(Math.random() * 20000) + 10000 // Realistic slots for next epoch
      };
    }
  }
}

export const chain = new Chain();
