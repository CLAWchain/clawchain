"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletRouter = void 0;
const express_1 = require("express");
const db_1 = require("../database/db");
const crypto_1 = __importDefault(require("crypto"));
const StateManager_1 = require("../blockchain/StateManager");
const walletRouter = (0, express_1.Router)();
exports.walletRouter = walletRouter;
// In-memory fallback for when DB is unavailable
const memoryWallets = new Map();
const memoryTransactions = new Map();
const memoryStakes = new Map();
// Generate Solana-style base58 address
const generateAddress = (prefix = 'molt_') => {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = prefix;
    for (let i = 0; i < 40; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
// Generate private key
const generatePrivateKey = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
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
    try {
        await db_1.db.exec(`
      CREATE TABLE IF NOT EXISTS wallets (
        id TEXT PRIMARY KEY,
        address TEXT UNIQUE NOT NULL,
        private_key TEXT,
        balance REAL DEFAULT 0,
        created_at BIGINT NOT NULL,
        last_faucet_claim BIGINT DEFAULT 0,
        total_received REAL DEFAULT 0,
        total_sent REAL DEFAULT 0,
        tx_count INTEGER DEFAULT 0
      )
    `);
        await db_1.db.exec(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id TEXT PRIMARY KEY,
        wallet_id TEXT NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        from_address TEXT,
        to_address TEXT,
        hash TEXT NOT NULL,
        timestamp BIGINT NOT NULL,
        status TEXT DEFAULT 'confirmed'
      )
    `);
        await db_1.db.exec(`
      CREATE TABLE IF NOT EXISTS staking_positions (
        id TEXT PRIMARY KEY,
        wallet_id TEXT NOT NULL,
        address TEXT NOT NULL,
        amount REAL NOT NULL,
        staked_at BIGINT NOT NULL,
        last_claim BIGINT NOT NULL,
        total_rewards_claimed REAL DEFAULT 0,
        status TEXT DEFAULT 'active'
      )
    `);
        // Test if DB is actually working
        const test = await db_1.db.query('SELECT 1 as test');
        if (test.rows && test.rows.length > 0) {
            dbAvailable = true;
            console.log('[WALLET] Database tables initialized');
        }
    }
    catch (error) {
        console.error('[WALLET] Table init error, using memory fallback:', error);
        dbAvailable = false;
    }
};
// Helper to get wallet (from DB or memory)
const getWallet = async (address) => {
    if (dbAvailable) {
        try {
            const result = await db_1.db.query(`SELECT * FROM wallets WHERE address = $1`, [address]);
            if (result.rows && result.rows.length > 0) {
                return result.rows[0];
            }
        }
        catch (error) {
            console.error('[WALLET] DB read error:', error);
        }
    }
    // Fallback to memory
    return memoryWallets.get(address);
};
// Helper to save wallet
const saveWallet = async (wallet) => {
    // Always save to memory
    memoryWallets.set(wallet.address, wallet);
    if (dbAvailable) {
        try {
            await db_1.db.query(`
        INSERT INTO wallets (id, address, private_key, balance, created_at, last_faucet_claim, total_received, total_sent, tx_count)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (address) DO UPDATE SET
          balance = EXCLUDED.balance,
          last_faucet_claim = EXCLUDED.last_faucet_claim,
          total_received = EXCLUDED.total_received,
          total_sent = EXCLUDED.total_sent,
          tx_count = EXCLUDED.tx_count
      `, [
                wallet.id, wallet.address, wallet.private_key || null, wallet.balance,
                wallet.created_at, wallet.last_faucet_claim || 0,
                wallet.total_received || 0, wallet.total_sent || 0, wallet.tx_count || 0
            ]);
        }
        catch (error) {
            console.error('[WALLET] DB save error:', error);
        }
    }
};
// Helper to add transaction
const addTransaction = async (tx) => {
    // Memory
    const txs = memoryTransactions.get(tx.wallet_id) || [];
    txs.unshift(tx);
    memoryTransactions.set(tx.wallet_id, txs.slice(0, 100));
    if (dbAvailable) {
        try {
            await db_1.db.query(`
        INSERT INTO wallet_transactions (id, wallet_id, type, amount, from_address, to_address, hash, timestamp, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING
      `, [tx.id, tx.wallet_id, tx.type, tx.amount, tx.from_address, tx.to_address, tx.hash, tx.timestamp, tx.status]);
        }
        catch (error) {
            console.error('[WALLET] TX save error:', error);
        }
    }
};
// Get transactions for a wallet
const getTransactions = async (walletId) => {
    if (dbAvailable) {
        try {
            const result = await db_1.db.query(`SELECT * FROM wallet_transactions WHERE wallet_id = $1 ORDER BY timestamp DESC LIMIT 50`, [walletId]);
            if (result.rows)
                return result.rows;
        }
        catch (error) {
            console.error('[WALLET] TX read error:', error);
        }
    }
    return memoryTransactions.get(walletId) || [];
};
// Create new wallet
walletRouter.post('/create', async (req, res) => {
    try {
        const walletId = `wallet_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
        const address = generateAddress();
        const privateKey = generatePrivateKey();
        const now = Date.now();
        const wallet = {
            id: walletId,
            address,
            private_key: privateKey,
            balance: 0,
            created_at: now,
            last_faucet_claim: 0,
            total_received: 0,
            total_sent: 0,
            tx_count: 0
        };
        await saveWallet(wallet);
        console.log(`[WALLET] Created: ${address}`);
        res.json({
            success: true,
            wallet: {
                id: walletId,
                address,
                privateKey,
                balance: 0,
                createdAt: now
            },
            message: 'Wallet created successfully! Save your private key securely.'
        });
    }
    catch (error) {
        console.error('[WALLET] Create error:', error);
        res.status(500).json({ success: false, error: 'Failed to create wallet' });
    }
});
// Get wallet by address
walletRouter.get('/address/:address', async (req, res) => {
    try {
        const wallet = await getWallet(req.params.address);
        if (wallet) {
            const transactions = await getTransactions(wallet.id);
            res.json({
                success: true,
                wallet: {
                    id: wallet.id,
                    address: wallet.address,
                    balance: wallet.balance || 0,
                    created_at: wallet.created_at,
                    last_faucet_claim: wallet.last_faucet_claim || 0,
                    total_received: wallet.total_received || 0,
                    total_sent: wallet.total_sent || 0,
                    tx_count: wallet.tx_count || 0,
                    transactions
                }
            });
        }
        else {
            res.status(404).json({ success: false, error: 'Wallet not found' });
        }
    }
    catch (error) {
        console.error('[WALLET] Fetch error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch wallet' });
    }
});
// Import wallet (check if exists, or create it)
walletRouter.post('/import', async (req, res) => {
    try {
        const { address } = req.body;
        if (!address || !address.startsWith('molt_')) {
            return res.status(400).json({ success: false, error: 'Invalid address format. Must start with molt_' });
        }
        let wallet = await getWallet(address);
        // If wallet doesn't exist, create it
        if (!wallet) {
            const walletId = `wallet_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
            const now = Date.now();
            wallet = {
                id: walletId,
                address,
                private_key: null,
                balance: 0,
                created_at: now,
                last_faucet_claim: 0,
                total_received: 0,
                total_sent: 0,
                tx_count: 0
            };
            await saveWallet(wallet);
            console.log(`[WALLET] Imported/Created: ${address}`);
        }
        const transactions = await getTransactions(wallet.id);
        res.json({
            success: true,
            wallet: {
                id: wallet.id,
                address: wallet.address,
                balance: wallet.balance || 0,
                created_at: wallet.created_at,
                last_faucet_claim: wallet.last_faucet_claim || 0,
                total_received: wallet.total_received || 0,
                total_sent: wallet.total_sent || 0,
                tx_count: wallet.tx_count || 0,
                transactions
            }
        });
    }
    catch (error) {
        console.error('[WALLET] Import error:', error);
        res.status(500).json({ success: false, error: 'Failed to import wallet' });
    }
});
// Claim from faucet
walletRouter.post('/faucet/claim', async (req, res) => {
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
        // Check cooldown
        if (timeSinceClaim < FAUCET_COOLDOWN_MS) {
            const remainingMs = FAUCET_COOLDOWN_MS - timeSinceClaim;
            const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
            return res.status(429).json({
                success: false,
                error: `Faucet on cooldown. Try again in ${remainingHours} hour${remainingHours > 1 ? 's' : ''}.`,
                nextClaimAt: lastClaim + FAUCET_COOLDOWN_MS
            });
        }
        // Generate transaction
        const txHash = generateAddress('tx_');
        const txId = `tx_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
        // Update blockchain state (100 CLAW with 18 decimals)
        const faucetAmountWithDecimals = BigInt(FAUCET_AMOUNT) * 10n ** 18n;
        const blockHeight = 0; // Will be included in next block
        try {
            const stateUpdated = await StateManager_1.stateManager.processFaucetRequest(address, faucetAmountWithDecimals, blockHeight);
            if (!stateUpdated) {
                console.log('[FAUCET] StateManager: Faucet has insufficient funds');
                // Continue anyway with wallet-only update for now
            }
        }
        catch (stateError) {
            console.error('[FAUCET] StateManager error:', stateError);
            // Continue with wallet update
        }
        // Update wallet
        wallet.balance = (wallet.balance || 0) + FAUCET_AMOUNT;
        wallet.last_faucet_claim = now;
        wallet.total_received = (wallet.total_received || 0) + FAUCET_AMOUNT;
        wallet.tx_count = (wallet.tx_count || 0) + 1;
        await saveWallet(wallet);
        // Record transaction
        await addTransaction({
            id: txId,
            wallet_id: wallet.id,
            type: 'faucet',
            amount: FAUCET_AMOUNT,
            from_address: 'CLAWCHAIN_FAUCET',
            to_address: address,
            hash: txHash,
            timestamp: now,
            status: 'confirmed'
        });
        // Get actual blockchain balance
        const blockchainBalance = StateManager_1.stateManager.getBalance(address);
        console.log(`[FAUCET] Claimed ${FAUCET_AMOUNT} CLAW to ${address} (blockchain: ${StateManager_1.stateManager.formatBalance(blockchainBalance)})`);
        res.json({
            success: true,
            amount: FAUCET_AMOUNT,
            txHash,
            newBalance: wallet.balance,
            nextClaimAt: now + FAUCET_COOLDOWN_MS,
            message: `Successfully claimed ${FAUCET_AMOUNT} CLAW!`
        });
    }
    catch (error) {
        console.error('[FAUCET] Claim error:', error);
        res.status(500).json({ success: false, error: 'Failed to claim from faucet' });
    }
});
// Get faucet status
walletRouter.get('/faucet/status/:address', async (req, res) => {
    try {
        const wallet = await getWallet(req.params.address);
        if (!wallet) {
            return res.json({ canClaim: true, nextClaimAt: 0, faucetAmount: FAUCET_AMOUNT });
        }
        const lastClaim = wallet.last_faucet_claim || 0;
        const now = Date.now();
        const canClaim = (now - lastClaim) >= FAUCET_COOLDOWN_MS;
        res.json({
            canClaim,
            nextClaimAt: canClaim ? 0 : lastClaim + FAUCET_COOLDOWN_MS,
            lastClaim,
            faucetAmount: FAUCET_AMOUNT
        });
    }
    catch (error) {
        res.json({ canClaim: true, nextClaimAt: 0, faucetAmount: FAUCET_AMOUNT });
    }
});
// Send tokens
walletRouter.post('/send', async (req, res) => {
    try {
        const { fromAddress, toAddress, amount } = req.body;
        if (!fromAddress || !toAddress || !amount) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }
        if (amount <= 0) {
            return res.status(400).json({ success: false, error: 'Amount must be positive' });
        }
        if (fromAddress === toAddress) {
            return res.status(400).json({ success: false, error: 'Cannot send to yourself' });
        }
        // Get sender
        const sender = await getWallet(fromAddress);
        if (!sender) {
            return res.status(404).json({ success: false, error: 'Sender wallet not found' });
        }
        if ((sender.balance || 0) < amount) {
            return res.status(400).json({ success: false, error: 'Insufficient balance' });
        }
        // Get or create recipient
        let recipient = await getWallet(toAddress);
        if (!recipient) {
            const recipientId = `wallet_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
            recipient = {
                id: recipientId,
                address: toAddress,
                private_key: null,
                balance: 0,
                created_at: Date.now(),
                last_faucet_claim: 0,
                total_received: 0,
                total_sent: 0,
                tx_count: 0
            };
            await saveWallet(recipient);
        }
        const txHash = generateAddress('tx_');
        const now = Date.now();
        // Update sender
        sender.balance = (sender.balance || 0) - amount;
        sender.total_sent = (sender.total_sent || 0) + amount;
        sender.tx_count = (sender.tx_count || 0) + 1;
        await saveWallet(sender);
        // Update recipient
        recipient.balance = (recipient.balance || 0) + amount;
        recipient.total_received = (recipient.total_received || 0) + amount;
        recipient.tx_count = (recipient.tx_count || 0) + 1;
        await saveWallet(recipient);
        // Record transactions
        await addTransaction({
            id: `${now}_send_${Math.random().toString(36).slice(2, 6)}`,
            wallet_id: sender.id,
            type: 'send',
            amount,
            from_address: fromAddress,
            to_address: toAddress,
            hash: txHash,
            timestamp: now,
            status: 'confirmed'
        });
        await addTransaction({
            id: `${now}_recv_${Math.random().toString(36).slice(2, 6)}`,
            wallet_id: recipient.id,
            type: 'receive',
            amount,
            from_address: fromAddress,
            to_address: toAddress,
            hash: txHash,
            timestamp: now,
            status: 'confirmed'
        });
        console.log(`[WALLET] Transfer: ${amount} CLAW from ${fromAddress.slice(0, 20)}... to ${toAddress.slice(0, 20)}...`);
        res.json({
            success: true,
            txHash,
            amount,
            from: fromAddress,
            to: toAddress,
            newBalance: sender.balance,
            message: `Successfully sent ${amount} CLAW!`
        });
    }
    catch (error) {
        console.error('[WALLET] Send error:', error);
        res.status(500).json({ success: false, error: 'Failed to send tokens' });
    }
});
// Get wallet transactions
walletRouter.get('/transactions/:address', async (req, res) => {
    try {
        const wallet = await getWallet(req.params.address);
        if (!wallet) {
            return res.json({ transactions: [] });
        }
        const transactions = await getTransactions(wallet.id);
        res.json({ transactions });
    }
    catch (error) {
        res.json({ transactions: [] });
    }
});
// Get top wallets (leaderboard)
walletRouter.get('/leaderboard', async (req, res) => {
    try {
        if (dbAvailable) {
            const result = await db_1.db.query(`
        SELECT address, balance, tx_count, total_received, total_sent, created_at
        FROM wallets 
        ORDER BY balance DESC 
        LIMIT 20
      `);
            return res.json({ wallets: result.rows || [] });
        }
        // Fallback to memory
        const wallets = Array.from(memoryWallets.values())
            .sort((a, b) => (b.balance || 0) - (a.balance || 0))
            .slice(0, 20)
            .map(w => ({
            address: w.address,
            balance: w.balance || 0,
            tx_count: w.tx_count || 0,
            total_received: w.total_received || 0,
            total_sent: w.total_sent || 0
        }));
        res.json({ wallets });
    }
    catch (error) {
        res.json({ wallets: [] });
    }
});
// ========== STAKING ENDPOINTS ==========
// Get staking pool stats
walletRouter.get('/staking/pool', async (req, res) => {
    try {
        let totalStaked = 0;
        let totalStakers = 0;
        let totalRewards = 0;
        if (dbAvailable) {
            const stakedResult = await db_1.db.query(`SELECT COALESCE(SUM(amount), 0) as total FROM staking_positions WHERE status = 'active'`);
            const stakersResult = await db_1.db.query(`SELECT COUNT(DISTINCT address) as count FROM staking_positions WHERE status = 'active'`);
            const rewardsResult = await db_1.db.query(`SELECT COALESCE(SUM(total_rewards_claimed), 0) as total FROM staking_positions`);
            totalStaked = parseFloat(stakedResult.rows?.[0]?.total) || 0;
            totalStakers = parseInt(stakersResult.rows?.[0]?.count) || 0;
            totalRewards = parseFloat(rewardsResult.rows?.[0]?.total) || 0;
        }
        else {
            // Memory fallback
            memoryStakes.forEach(stake => {
                if (stake.status === 'active') {
                    totalStaked += stake.amount;
                    totalStakers++;
                    totalRewards += stake.total_rewards_claimed || 0;
                }
            });
        }
        res.json({
            totalStaked,
            totalStakers,
            totalRewardsPaid: totalRewards,
            apy: STAKING_APY * 100,
            minStake: MIN_STAKE
        });
    }
    catch (error) {
        res.json({ totalStaked: 0, totalStakers: 0, totalRewardsPaid: 0, apy: 12, minStake: 10 });
    }
});
// Get user staking position
walletRouter.get('/staking/position/:address', async (req, res) => {
    try {
        let position = null;
        if (dbAvailable) {
            const result = await db_1.db.query(`SELECT * FROM staking_positions WHERE address = $1 AND status = 'active'`, [req.params.address]);
            if (result.rows && result.rows.length > 0) {
                position = result.rows[0];
            }
        }
        else {
            position = memoryStakes.get(req.params.address);
            if (position && position.status !== 'active')
                position = null;
        }
        if (position) {
            const now = Date.now();
            const timeStaked = now - position.staked_at;
            const timeSinceLastClaim = now - position.last_claim;
            // Calculate pending rewards
            const yearMs = 365 * 24 * 60 * 60 * 1000;
            const pendingRewards = (position.amount * STAKING_APY * timeSinceLastClaim) / yearMs;
            res.json({
                hasPosition: true,
                position: {
                    ...position,
                    pendingRewards: Math.floor(pendingRewards * 100) / 100,
                    timeStaked,
                    dailyReward: (position.amount * STAKING_APY) / 365
                }
            });
        }
        else {
            res.json({ hasPosition: false, position: null });
        }
    }
    catch (error) {
        res.json({ hasPosition: false, position: null });
    }
});
// Stake tokens
walletRouter.post('/staking/stake', async (req, res) => {
    try {
        const { address, amount } = req.body;
        if (!address || !amount || amount < MIN_STAKE) {
            return res.status(400).json({ success: false, error: `Minimum stake is ${MIN_STAKE} CLAW` });
        }
        // Get wallet
        const wallet = await getWallet(address);
        if (!wallet) {
            return res.status(404).json({ success: false, error: 'Wallet not found' });
        }
        if ((wallet.balance || 0) < amount) {
            return res.status(400).json({ success: false, error: 'Insufficient balance' });
        }
        const now = Date.now();
        // Check for existing position
        let existingPosition = null;
        if (dbAvailable) {
            const result = await db_1.db.query(`SELECT * FROM staking_positions WHERE address = $1 AND status = 'active'`, [address]);
            if (result.rows && result.rows.length > 0) {
                existingPosition = result.rows[0];
            }
        }
        else {
            existingPosition = memoryStakes.get(address);
            if (existingPosition && existingPosition.status !== 'active')
                existingPosition = null;
        }
        if (existingPosition) {
            // Add to existing position
            existingPosition.amount += amount;
            if (dbAvailable) {
                await db_1.db.query(`UPDATE staking_positions SET amount = $1 WHERE address = $2 AND status = 'active'`, [existingPosition.amount, address]);
            }
            memoryStakes.set(address, existingPosition);
        }
        else {
            // Create new position
            const positionId = `stake_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
            const newPosition = {
                id: positionId,
                wallet_id: wallet.id,
                address,
                amount,
                staked_at: now,
                last_claim: now,
                total_rewards_claimed: 0,
                status: 'active'
            };
            if (dbAvailable) {
                await db_1.db.query(`
          INSERT INTO staking_positions (id, wallet_id, address, amount, staked_at, last_claim, total_rewards_claimed, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [positionId, wallet.id, address, amount, now, now, 0, 'active']);
            }
            memoryStakes.set(address, newPosition);
        }
        // Deduct from wallet
        wallet.balance = (wallet.balance || 0) - amount;
        await saveWallet(wallet);
        // Record transaction
        const txHash = generateAddress('tx_');
        await addTransaction({
            id: `${now}_stake_${Math.random().toString(36).slice(2, 6)}`,
            wallet_id: wallet.id,
            type: 'stake',
            amount,
            from_address: address,
            to_address: 'STAKING_POOL',
            hash: txHash,
            timestamp: now,
            status: 'confirmed'
        });
        console.log(`[STAKING] ${address.slice(0, 20)}... staked ${amount} CLAW`);
        res.json({
            success: true,
            amount,
            txHash,
            message: `Successfully staked ${amount} CLAW!`
        });
    }
    catch (error) {
        console.error('[STAKING] Stake error:', error);
        res.status(500).json({ success: false, error: 'Failed to stake' });
    }
});
// Claim staking rewards
walletRouter.post('/staking/claim', async (req, res) => {
    try {
        const { address } = req.body;
        let position = null;
        if (dbAvailable) {
            const result = await db_1.db.query(`SELECT * FROM staking_positions WHERE address = $1 AND status = 'active'`, [address]);
            if (result.rows && result.rows.length > 0) {
                position = result.rows[0];
            }
        }
        else {
            position = memoryStakes.get(address);
            if (position && position.status !== 'active')
                position = null;
        }
        if (!position) {
            return res.status(404).json({ success: false, error: 'No active staking position' });
        }
        const now = Date.now();
        const timeSinceLastClaim = now - position.last_claim;
        // Calculate rewards
        const yearMs = 365 * 24 * 60 * 60 * 1000;
        const rewards = (position.amount * STAKING_APY * timeSinceLastClaim) / yearMs;
        const roundedRewards = Math.floor(rewards * 100) / 100;
        if (roundedRewards < 0.01) {
            return res.status(400).json({ success: false, error: 'Minimum claimable reward is 0.01 CLAW' });
        }
        // Get wallet
        const wallet = await getWallet(address);
        if (!wallet) {
            return res.status(404).json({ success: false, error: 'Wallet not found' });
        }
        // Update position
        position.last_claim = now;
        position.total_rewards_claimed = (position.total_rewards_claimed || 0) + roundedRewards;
        if (dbAvailable) {
            await db_1.db.query(`
        UPDATE staking_positions 
        SET last_claim = $1, total_rewards_claimed = $2 
        WHERE address = $3 AND status = 'active'
      `, [now, position.total_rewards_claimed, address]);
        }
        memoryStakes.set(address, position);
        // Add rewards to wallet
        wallet.balance = (wallet.balance || 0) + roundedRewards;
        wallet.total_received = (wallet.total_received || 0) + roundedRewards;
        await saveWallet(wallet);
        // Record transaction
        const txHash = generateAddress('tx_');
        await addTransaction({
            id: `${now}_reward_${Math.random().toString(36).slice(2, 6)}`,
            wallet_id: wallet.id,
            type: 'reward',
            amount: roundedRewards,
            from_address: 'STAKING_POOL',
            to_address: address,
            hash: txHash,
            timestamp: now,
            status: 'confirmed'
        });
        console.log(`[STAKING] ${address.slice(0, 20)}... claimed ${roundedRewards} CLAW rewards`);
        res.json({
            success: true,
            rewards: roundedRewards,
            txHash,
            message: `Claimed ${roundedRewards} CLAW in staking rewards!`
        });
    }
    catch (error) {
        console.error('[STAKING] Claim error:', error);
        res.status(500).json({ success: false, error: 'Failed to claim rewards' });
    }
});
// Unstake tokens
walletRouter.post('/staking/unstake', async (req, res) => {
    try {
        const { address, amount } = req.body;
        let position = null;
        if (dbAvailable) {
            const result = await db_1.db.query(`SELECT * FROM staking_positions WHERE address = $1 AND status = 'active'`, [address]);
            if (result.rows && result.rows.length > 0) {
                position = result.rows[0];
            }
        }
        else {
            position = memoryStakes.get(address);
            if (position && position.status !== 'active')
                position = null;
        }
        if (!position) {
            return res.status(404).json({ success: false, error: 'No active staking position' });
        }
        const unstakeAmount = amount || position.amount;
        if (unstakeAmount > position.amount) {
            return res.status(400).json({ success: false, error: 'Cannot unstake more than staked amount' });
        }
        const now = Date.now();
        // Calculate pending rewards
        const timeSinceLastClaim = now - position.last_claim;
        const yearMs = 365 * 24 * 60 * 60 * 1000;
        const pendingRewards = Math.floor(((position.amount * STAKING_APY * timeSinceLastClaim) / yearMs) * 100) / 100;
        // Get wallet
        const wallet = await getWallet(address);
        if (!wallet) {
            return res.status(404).json({ success: false, error: 'Wallet not found' });
        }
        // Update or close position
        if (unstakeAmount >= position.amount) {
            position.status = 'closed';
            if (dbAvailable) {
                await db_1.db.query(`UPDATE staking_positions SET status = 'closed' WHERE address = $1 AND status = 'active'`, [address]);
            }
        }
        else {
            position.amount -= unstakeAmount;
            position.last_claim = now;
            if (dbAvailable) {
                await db_1.db.query(`
          UPDATE staking_positions 
          SET amount = $1, last_claim = $2 
          WHERE address = $3 AND status = 'active'
        `, [position.amount, now, address]);
            }
        }
        memoryStakes.set(address, position);
        // Return tokens + rewards to wallet
        const totalReturn = unstakeAmount + pendingRewards;
        wallet.balance = (wallet.balance || 0) + totalReturn;
        wallet.total_received = (wallet.total_received || 0) + pendingRewards;
        await saveWallet(wallet);
        // Record transactions
        const txHash = generateAddress('tx_');
        await addTransaction({
            id: `${now}_unstake_${Math.random().toString(36).slice(2, 6)}`,
            wallet_id: wallet.id,
            type: 'unstake',
            amount: unstakeAmount,
            from_address: 'STAKING_POOL',
            to_address: address,
            hash: txHash,
            timestamp: now,
            status: 'confirmed'
        });
        if (pendingRewards > 0) {
            await addTransaction({
                id: `${now}_reward_${Math.random().toString(36).slice(2, 6)}`,
                wallet_id: wallet.id,
                type: 'reward',
                amount: pendingRewards,
                from_address: 'STAKING_POOL',
                to_address: address,
                hash: generateAddress('tx_'),
                timestamp: now,
                status: 'confirmed'
            });
        }
        console.log(`[STAKING] ${address.slice(0, 20)}... unstaked ${unstakeAmount} CLAW (+ ${pendingRewards} rewards)`);
        res.json({
            success: true,
            unstaked: unstakeAmount,
            rewards: pendingRewards,
            txHash,
            message: `Unstaked ${unstakeAmount} CLAW${pendingRewards > 0 ? ` + ${pendingRewards} rewards` : ''}!`
        });
    }
    catch (error) {
        console.error('[STAKING] Unstake error:', error);
        res.status(500).json({ success: false, error: 'Failed to unstake' });
    }
});
// Get staking leaderboard
walletRouter.get('/staking/leaderboard', async (req, res) => {
    try {
        if (dbAvailable) {
            const result = await db_1.db.query(`
        SELECT address, amount, staked_at, total_rewards_claimed
        FROM staking_positions 
        WHERE status = 'active'
        ORDER BY amount DESC 
        LIMIT 20
      `);
            return res.json({ stakers: result.rows || [] });
        }
        // Memory fallback
        const stakers = Array.from(memoryStakes.values())
            .filter(s => s.status === 'active')
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 20)
            .map(s => ({
            address: s.address,
            amount: s.amount,
            staked_at: s.staked_at,
            total_rewards_claimed: s.total_rewards_claimed || 0
        }));
        res.json({ stakers });
    }
    catch (error) {
        res.json({ stakers: [] });
    }
});
// Initialize tables on load
initializeWalletTables();
//# sourceMappingURL=wallet.js.map