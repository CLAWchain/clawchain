import { Router } from 'express';
import { db } from '../database/db';
import crypto from 'crypto';
import { stateManager } from '../blockchain/StateManager';
import rateLimit from 'express-rate-limit';

const walletRouter = Router();

// In-memory fallback for when DB is unavailable
const memoryWallets: Map<string, any> = new Map();
const memoryTransactions: Map<string, any[]> = new Map();
const memoryStakes: Map<string, any> = new Map();

// Generate Solana-style base58 address
const generateAddress = (prefix: string = 'molt_') => {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = prefix;
  for (let i = 0; i < 40; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate private key
const generatePrivateKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Faucet cooldown: 24 hours
const FAUCET_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const FAUCET_AMOUNT = 100;

// Staking constants
const STAKING_APY = 0.12; // 12% APY
const MIN_STAKE = 10;

// Check if DB is available
let dbAvailable = false;

// Initialize wallet tables
const initializeWalletTables = async () => {
  // ... existing code ...
};

// Helper to get wallet (from DB or memory)
const getWallet = async (address: string) => {
  // ... existing code ...
};

// Helper to save wallet
const saveWallet = async (wallet: any) => {
  // ... existing code ...
};

// Helper to add transaction
const addTransaction = async (tx: any) => {
  // ... existing code ...
};

// Get transactions for a wallet
const getTransactions = async (walletId: string) => {
  // ... existing code ...
};

// IP-based rate limiter
const faucetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many faucet requests from this IP, please try again after an hour.'
});

// Wallet address-based cooldown
const walletCooldownMap: Map<string, number> = new Map();
const WALLET_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

// Create new wallet
walletRouter.post('/create', async (req, res) => {
  // ... existing code ...
});

// Get wallet by address
walletRouter.get('/address/:address', async (req, res) => {
  // ... existing code ...
});

// Import wallet (check if exists, or create it)
walletRouter.post('/import', async (req, res) => {
  // ... existing code ...
});

// Claim from faucet
walletRouter.post('/faucet/claim', faucetRateLimiter, async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ success: false, error: 'Address required' });
    }

    let wallet = await getWallet(address);

    // Auto-create wallet if it doesn't exist
    if (!wallet) {
      const walletId = `wallet_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
      wallet = {
        id: walletId,
        address,
        private_key: null,
        balance: 0,
        created_at: Date.now(),
        last_faucet_claim: 0,
        total_received: 0,
        total_sent: 0,
        tx_count: 0
      };
      await saveWallet(wallet);
    }

    const now = Date.now();
    const lastClaim = wallet.last_faucet_claim || 0;
    const timeSinceClaim = now - lastClaim;

    // Check faucet cooldown
    if (timeSinceClaim < FAUCET_COOLDOWN_MS) {
      const remainingMs = FAUCET_COOLDOWN_MS - timeSinceClaim;
      const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
      return res.status(429).json({
        success: false,
        error: `Faucet on cooldown. Try again in ${remainingHours} hour${remainingHours > 1 ? 's' : ''}.`,
        nextClaimAt: lastClaim + FAUCET_COOLDOWN_MS
      });
    }

    // Check wallet-based cooldown
    const lastWalletClaim = walletCooldownMap.get(address) || 0;
    const walletTimeSinceClaim = now - lastWalletClaim;
    if (walletTimeSinceClaim < WALLET_COOLDOWN_MS) {
      const remainingMs = WALLET_COOLDOWN_MS - walletTimeSinceClaim;
      const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
      return res.status(429).json({
        success: false,
        error: `Wallet on cooldown. Try again in ${remainingHours} hour${remainingHours > 1 ? 's' : ''}.`,
        nextClaimAt: lastWalletClaim + WALLET_COOLDOWN_MS
      });
    }

    // Update wallet and faucet claim
    wallet.balance += FAUCET_AMOUNT;
    wallet.last_faucet_claim = now;
    wallet.total_received += FAUCET_AMOUNT;
    wallet.tx_count += 1;
    await saveWallet(wallet);

    // Update wallet-based cooldown
    walletCooldownMap.set(address, now);

    res.json({
      success: true,
      message: `Faucet claim successful! You received ${FAUCET_AMOUNT} CLAW.`,
      balance: wallet.balance
    });
  } catch (error) {
    console.error('[WALLET] Faucet claim error:', error);
    res.status(500).json({ success: false, error: 'Failed to claim from faucet' });
  }
});

export default walletRouter;