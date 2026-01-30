"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const Chain_1 = require("../blockchain/Chain");
const TransactionPool_1 = require("../blockchain/TransactionPool");
const BlockProducer_1 = require("../blockchain/BlockProducer");
const ValidatorManager_1 = require("../validators/ValidatorManager");
const EventBus_1 = require("../events/EventBus");
const StateManager_1 = require("../blockchain/StateManager");
const db_1 = require("../database/db");
const schema_1 = require("../database/schema");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
async function main() {
    console.log('[INIT] 🦞 Starting ClawChain - The AI that actually does things...\n');
    console.log('[ENV] Environment check:');
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '[OK] Set' : '[--] Not set'}`);
    console.log(`   REDIS_URL: ${process.env.REDIS_URL ? '[OK] Set' : '[--] Not set'}`);
    console.log(`   ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? '[OK] Set' : '[--] Not set'}\n`);
    try {
        // Connect to database
        const connected = await db_1.db.connect();
        if (connected) {
            // Create tables if they don't exist
            await db_1.db.exec(schema_1.createTables);
            console.log('[DB] PostgreSQL database ready\n');
        }
        else {
            console.log('[DB] Running without persistent database\n');
        }
    }
    catch (error) {
        console.error('[DB] Database setup warning:', error);
        console.log('Continuing with in-memory fallback...\n');
    }
    const eventBus = EventBus_1.EventBus.getInstance();
    const chain = new Chain_1.Chain();
    const txPool = new TransactionPool_1.TransactionPool();
    const validatorManager = new ValidatorManager_1.ValidatorManager();
    const blockProducer = new BlockProducer_1.BlockProducer(chain, txPool, validatorManager, eventBus);
    await chain.initialize();
    await txPool.initialize();
    await StateManager_1.stateManager.initialize();
    await validatorManager.initialize();
    console.log('[STATE] Initial state loaded:');
    console.log(`   State Root: ${StateManager_1.stateManager.getStateRoot().substring(0, 20)}...`);
    console.log(`   Total Supply: ${StateManager_1.stateManager.formatBalance(StateManager_1.stateManager.getTotalSupply())}`);
    console.log(`   Circulating: ${StateManager_1.stateManager.formatBalance(StateManager_1.stateManager.getCirculatingSupply())}\n`);
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    // Health check endpoint for Railway
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok' });
    });
    // API status check (no key exposure)
    app.get('/api/config/status', (req, res) => {
        res.json({
            anthropicKey: process.env.ANTHROPIC_API_KEY ? 'configured' : 'not_set'
        });
    });
    app.get('/api/status', (req, res) => {
        res.json({
            status: 'online',
            chainLength: chain.getChainLength(),
            pendingTransactions: txPool.getPendingCount(),
            validators: validatorManager.getAllValidators().length,
            genesisTime: chain.getGenesisTime(),
            totalTransactions: chain.getTotalTransactions(),
            uptime: Date.now() - chain.getGenesisTime(),
            redisConnected: db_1.cache.isConnected(),
            stateRoot: StateManager_1.stateManager.getStateRoot(),
            totalSupply: StateManager_1.stateManager.getTotalSupply().toString(),
            circulatingSupply: StateManager_1.stateManager.getCirculatingSupply().toString()
        });
    });
    // State endpoints
    app.get('/api/state', (req, res) => {
        res.json({
            stateRoot: StateManager_1.stateManager.getStateRoot(),
            totalSupply: StateManager_1.stateManager.formatBalance(StateManager_1.stateManager.getTotalSupply()),
            circulatingSupply: StateManager_1.stateManager.formatBalance(StateManager_1.stateManager.getCirculatingSupply()),
            accounts: StateManager_1.stateManager.getAccountsSummary().slice(0, 20)
        });
    });
    app.get('/api/state/account/:address', (req, res) => {
        const account = StateManager_1.stateManager.getAccount(req.params.address);
        if (account) {
            res.json({
                address: account.address,
                balance: StateManager_1.stateManager.formatBalance(account.balance),
                balanceRaw: account.balance.toString(),
                nonce: account.nonce
            });
        }
        else {
            res.json({
                address: req.params.address,
                balance: '0 CLAW',
                balanceRaw: '0',
                nonce: 0
            });
        }
    });
    app.get('/api/state/balance/:address', (req, res) => {
        const balance = StateManager_1.stateManager.getBalance(req.params.address);
        res.json({
            address: req.params.address,
            balance: StateManager_1.stateManager.formatBalance(balance),
            balanceRaw: balance.toString()
        });
    });
    app.get('/api/blocks', async (req, res) => {
        const blocks = chain.getAllBlocks();
        res.json(blocks.map(b => b.toJSON()));
    });
    app.get('/api/blocks/:height', (req, res) => {
        const block = chain.getBlockByHeight(parseInt(req.params.height));
        if (block) {
            res.json(block.toJSON());
        }
        else {
            res.status(404).json({ error: 'Block not found' });
        }
    });
    app.get('/api/validators', async (req, res) => {
        const validators = validatorManager.getAllValidators();
        res.json(validators.map(v => ({
            address: v.address,
            name: v.name,
            symbol: v.symbol,
            model: v.model,
            provider: v.provider,
            role: v.role,
            personality: v.personality,
            philosophy: v.philosophy
        })));
    });
    app.post('/api/transactions', async (req, res) => {
        try {
            const { from, to, value, gasPrice, gasLimit, nonce, data, signature } = req.body;
            // Generate Solana-style base58 transaction hash
            const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
            const txHash = Array.from({ length: 44 }, () => BASE58[Math.floor(Math.random() * 58)]).join('');
            const tx = {
                hash: txHash,
                from,
                to,
                value: BigInt(value),
                gasPrice: BigInt(gasPrice),
                gasLimit: BigInt(gasLimit),
                nonce,
                data,
                signature
            };
            const added = await txPool.addTransaction(tx);
            if (added) {
                eventBus.emit('transaction_added', tx);
                res.json({ success: true, hash: tx.hash });
            }
            else {
                res.status(400).json({ error: 'Invalid transaction' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    app.post('/api/chat/:validator', async (req, res) => {
        try {
            const validatorName = req.params.validator.toUpperCase();
            const { message } = req.body;
            const validators = validatorManager.getAllValidators();
            // Find validator by name (handles both "CLAW" and "CLAW VALIDATOR" etc)
            const validator = validators.find(v => v.name === validatorName ||
                v.name.includes(validatorName) ||
                validatorName.includes('CLAW'));
            if (!validator) {
                return res.status(404).json({ error: 'Validator not found' });
            }
            // Build context for smarter responses
            const context = {
                blockHeight: chain.getChainLength(),
                tps: txPool.getPendingCount(),
                validators: validators.length
            };
            const response = await validator.chat(message, context);
            await db_1.db.query(`
        INSERT INTO chat_logs (validator_address, role, content)
        VALUES ($1, 'user', $2), ($1, 'assistant', $3)
      `, [validator.address, message, response]);
            res.json({ response });
        }
        catch (error) {
            console.error('Chat error:', error);
            res.status(500).json({ error: error.message });
        }
    });
    // Terminal chat endpoint - powered by Claw API
    app.post('/api/personality/:validator', async (req, res) => {
        try {
            // Accept both 'message' and 'command' for flexibility
            const userMessage = req.body.message || req.body.command;
            const userContext = req.body.context || {};
            if (!userMessage) {
                return res.status(400).json({ error: 'Message is required', message: 'Please provide a message.' });
            }
            const validators = validatorManager.getAllValidators();
            const validator = validators[0]; // Use first Claw validator
            if (!validator) {
                return res.status(404).json({ error: 'No validators available', message: 'No Claw validator is currently available.' });
            }
            // Merge context from request with chain state
            const context = {
                blockHeight: userContext.blockHeight || chain.getChainLength(),
                tps: userContext.tps || txPool.getPendingCount(),
                validators: validators.length,
                gasPrice: userContext.gasPrice || 5,
                chainId: userContext.chainId || 1337
            };
            console.log('[TERMINAL] Chat request:', userMessage.substring(0, 50) + '...');
            const response = await validator.chat(userMessage, context);
            // Return in format frontend expects
            res.json({ message: response, response });
        }
        catch (error) {
            console.error('Terminal chat error:', error);
            res.status(500).json({
                error: error.message,
                message: 'I encountered an error processing your request. Please try again.'
            });
        }
    });
    // ========== USER CIP SUBMISSION SYSTEM ==========
    const { cipSubmitRouter } = await Promise.resolve().then(() => __importStar(require('./cip-submit')));
    app.use('/api/cip', cipSubmitRouter);
    console.log('[CIP] Submission system ready');
    // ========== USER AGENTS SYSTEM ==========
    const { agentsRouter } = await Promise.resolve().then(() => __importStar(require('./agents')));
    app.use('/api/agents', agentsRouter);
    console.log('[AGENTS] User agents system ready');
    // ========== WALLET & FAUCET SYSTEM ==========
    const { walletRouter } = await Promise.resolve().then(() => __importStar(require('./wallet')));
    app.use('/api/wallet', walletRouter);
    console.log('[WALLET] Wallet & faucet system ready');
    // ========== ADMIN DASHBOARD ==========
    const { adminRouter } = await Promise.resolve().then(() => __importStar(require('./admin')));
    app.use('/api/admin', adminRouter);
    console.log('[ADMIN] Admin dashboard API ready');
    // ========== LOGS SYSTEM ==========
    const { logsRouter, initializeLogsTable, addLog } = await Promise.resolve().then(() => __importStar(require('./logs')));
    await initializeLogsTable();
    app.use('/api/logs', logsRouter);
    // Make addLog available globally for agent logging
    global.addLog = addLog;
    console.log('[LOGS] Logs system ready');
    // ========== AUTH SYSTEM ==========
    const { authRouter, initializeAuthTables } = await Promise.resolve().then(() => __importStar(require('./auth')));
    await initializeAuthTables();
    app.use('/api/auth', authRouter);
    console.log('[AUTH] Authentication system ready');
    // ========== SKILLS SYSTEM ==========
    const { skillManager } = await Promise.resolve().then(() => __importStar(require('../agent/SkillManager')));
    await skillManager.initialize();
    // Skills API endpoints
    app.get('/api/skills', (req, res) => {
        res.json({ skills: skillManager.listSkills() });
    });
    app.get('/api/skills/:id', (req, res) => {
        const skill = skillManager.getSkill(req.params.id);
        if (skill) {
            res.json(skill);
        }
        else {
            res.status(404).json({ error: 'Skill not found' });
        }
    });
    app.post('/api/skills/:id/enable', (req, res) => {
        const success = skillManager.enableSkill(req.params.id);
        res.json({ success });
    });
    app.post('/api/skills/:id/disable', (req, res) => {
        const success = skillManager.disableSkill(req.params.id);
        res.json({ success });
    });
    console.log('[SKILLS] Skills system ready');
    // ========== LIVE DEBATE SYSTEM ==========
    const { getCurrentDebate, getAllDebates, getDebateTopics, addDebateListener, startAutoDebate } = await Promise.resolve().then(() => __importStar(require('./debate')));
    // Start auto-debate system automatically
    startAutoDebate();
    console.log('[COUNCIL] Live debate system started');
    // Get available debate topics
    app.get('/api/debate/topics', (req, res) => {
        res.json({ topics: getDebateTopics() });
    });
    // Get all past debates
    app.get('/api/debate/all', (req, res) => {
        res.json({ debates: getAllDebates() });
    });
    // Get current active debate
    app.get('/api/debate/current', (req, res) => {
        const debate = getCurrentDebate();
        res.json({ debate });
    });
    // SSE endpoint - ALL users connect here to watch the same debate
    app.get('/api/debate/stream', (req, res) => {
        // Set up SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.flushHeaders();
        console.log('[VIEWER] New debate viewer connected');
        // Send current debate state if one is active
        const currentDebate = getCurrentDebate();
        if (currentDebate) {
            res.write(`data: ${JSON.stringify({
                type: 'current_state',
                debate: currentDebate
            })}\n\n`);
        }
        // Subscribe to debate updates
        const removeListener = addDebateListener((message) => {
            try {
                res.write(`data: ${JSON.stringify(message)}\n\n`);
            }
            catch (e) {
                // Client disconnected
            }
        });
        // Send heartbeat every 30 seconds to keep connection alive
        const heartbeat = setInterval(() => {
            try {
                res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
            }
            catch (e) {
                clearInterval(heartbeat);
            }
        }, 30000);
        // Handle client disconnect
        req.on('close', () => {
            console.log('[VIEWER] Debate viewer disconnected');
            removeListener();
            clearInterval(heartbeat);
        });
    });
    // ========== END DEBATE SYSTEM ==========
    // ========== PLAYGROUND SYSTEM ==========
    const { playgroundRouter } = await Promise.resolve().then(() => __importStar(require('./playground')));
    app.use('/api/playground', playgroundRouter);
    console.log('[WORKSHOP] Playground system started');
    // ========== END PLAYGROUND SYSTEM ==========
    // ========== BYZANTINE BEHAVIOR SYSTEM ==========
    try {
        const byzantineRoutes = (await Promise.resolve().then(() => __importStar(require('../byzantine/routes')))).default;
        app.use('/api/byzantine', byzantineRoutes);
        console.log('[BYZANTINE] Byzantine behavior system ready');
    }
    catch (error) {
        console.error('[BYZANTINE] Failed to load Byzantine system:', error);
    }
    // ========== END BYZANTINE SYSTEM ==========
    // ========== AUTONOMOUS AGENT WORKER SYSTEM ==========
    const { agentWorker, agentEvents, agentMemory } = await Promise.resolve().then(() => __importStar(require('../agent')));
    // Track connected SSE clients
    let agentViewerCount = 0;
    // SSE endpoint for live agent work streaming
    app.get('/api/agent/stream', (req, res) => {
        // Set up SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.flushHeaders();
        agentViewerCount++;
        console.log(`[AGENT] New viewer connected (total: ${agentViewerCount})`);
        // Send current state to new connection
        const state = agentWorker.getState();
        // Get persisted tasks from memory (survives restarts)
        const persistedTasks = agentMemory.getCompletedTasks(5);
        res.write(`data: ${JSON.stringify({
            type: 'init',
            data: {
                isWorking: state.isWorking,
                currentTask: state.currentTask ? {
                    id: state.currentTask.id,
                    title: state.currentTask.title,
                    type: state.currentTask.type,
                    agent: state.currentTask.agent,
                } : null,
                currentOutput: state.currentOutput,
                completedTasks: persistedTasks.map(t => ({
                    title: t.title,
                    agent: t.agent,
                    completedAt: t.completedAt,
                })),
                viewerCount: agentViewerCount,
            },
            timestamp: Date.now()
        })}\n\n`);
        // Subscribe to agent events
        const onChunk = (chunk) => {
            try {
                res.write(`data: ${JSON.stringify({ ...chunk, viewerCount: agentViewerCount })}\n\n`);
            }
            catch (e) {
                // Client disconnected
            }
        };
        agentEvents.on('chunk', onChunk);
        // Send heartbeat every 10 seconds
        const heartbeat = setInterval(() => {
            try {
                res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now(), viewerCount: agentViewerCount })}\n\n`);
            }
            catch (e) {
                clearInterval(heartbeat);
            }
        }, 10000);
        // Handle client disconnect
        req.on('close', () => {
            agentViewerCount--;
            console.log(`[AGENT] Viewer disconnected (total: ${agentViewerCount})`);
            agentEvents.off('chunk', onChunk);
            clearInterval(heartbeat);
        });
    });
    // Get agent status
    app.get('/api/agent/status', (req, res) => {
        const state = agentWorker.getState();
        // Get persisted completed tasks from memory
        const persistedTasks = agentMemory.getCompletedTasks(10);
        res.json({
            isWorking: state.isWorking,
            currentTask: state.currentTask ? {
                id: state.currentTask.id,
                title: state.currentTask.title,
                type: state.currentTask.type,
                agent: state.currentTask.agent,
            } : null,
            completedTaskCount: persistedTasks.length,
            recentTasks: persistedTasks.slice(0, 5).map(t => ({
                title: t.title,
                agent: t.agent,
                completedAt: t.completedAt,
            })),
            viewerCount: agentViewerCount,
            // Chain stats
            blockHeight: chain.getChainLength(),
            transactionCount: chain.getTotalTransactions(),
        });
    });
    // Get persisted completed tasks
    app.get('/api/agent/history', (req, res) => {
        const limit = parseInt(req.query.limit) || 20;
        const tasks = agentMemory.getCompletedTasks(limit);
        res.json({
            tasks: tasks.map(t => ({
                id: t.id,
                taskId: t.taskId,
                title: t.title,
                type: t.taskType,
                agent: t.agent,
                output: t.output.substring(0, 500), // Truncate output
                completedAt: t.completedAt,
            })),
            total: tasks.length
        });
    });
    // Git status endpoint
    app.get('/api/git/status', async (req, res) => {
        const { gitIntegration } = await Promise.resolve().then(() => __importStar(require('../agent/GitIntegration')));
        const status = gitIntegration.getStatus();
        const commits = gitIntegration.getRecentCommits(5);
        const summary = gitIntegration.getSummary();
        res.json({
            branch: status.branch,
            clean: status.clean,
            changes: status.changes,
            staged: status.staged,
            recentCommits: commits,
            summary
        });
    });
    // CI status endpoint
    app.get('/api/ci/status', async (req, res) => {
        const { ciMonitor } = await Promise.resolve().then(() => __importStar(require('../agent/CIMonitor')));
        const status = ciMonitor.getStatus();
        res.json(status);
    });
    // Run CI checks manually
    app.post('/api/ci/run', async (req, res) => {
        const { ciMonitor } = await Promise.resolve().then(() => __importStar(require('../agent/CIMonitor')));
        const results = await ciMonitor.runAllChecks();
        res.json(results);
    });
    // Task sources status
    app.get('/api/tasks/pending', async (req, res) => {
        const { taskSources } = await Promise.resolve().then(() => __importStar(require('../agent/TaskSources')));
        const tasks = await taskSources.collectAllTasks();
        res.json({
            count: tasks.length,
            tasks: tasks.slice(0, 20).map(t => ({
                id: t.id,
                source: t.source,
                title: t.title,
                priority: t.priority,
                createdAt: t.createdAt
            }))
        });
    });
    // Task backlog status
    app.get('/api/tasks/backlog', async (req, res) => {
        const { TASK_BACKLOG, getBacklogProgress, getTotalEstimatedTime, getTasksByPriority } = await Promise.resolve().then(() => __importStar(require('../agent/TaskBacklog')));
        const progress = getBacklogProgress();
        const time = getTotalEstimatedTime();
        const tasks = getTasksByPriority();
        res.json({
            progress,
            estimatedTime: time,
            totalTasks: TASK_BACKLOG.length,
            nextTasks: tasks.slice(progress.completed, progress.completed + 10).map(t => ({
                id: t.id,
                title: t.title,
                type: t.type,
                priority: t.priority,
                estimatedMinutes: t.estimatedMinutes,
                tags: t.tags
            }))
        });
    });
    // Start the autonomous agent worker
    agentWorker.start();
    console.log('[AGENT] Autonomous agent worker started');
    // Set up logging for agent events
    let currentTaskId;
    let currentTaskTitle;
    agentEvents.on('chunk', (chunk) => {
        try {
            switch (chunk.type) {
                case 'task_start':
                    currentTaskId = chunk.data?.task?.id;
                    currentTaskTitle = chunk.data?.task?.title;
                    addLog('task_start', `Starting: ${chunk.data?.task?.title || 'Unknown task'}`, currentTaskId, currentTaskTitle);
                    break;
                case 'task_complete':
                    addLog('task_complete', `Completed: ${chunk.data?.title || currentTaskTitle || 'Unknown task'}`, chunk.data?.taskId || currentTaskId, chunk.data?.title || currentTaskTitle);
                    currentTaskId = undefined;
                    currentTaskTitle = undefined;
                    break;
                case 'text':
                    // Only log significant text chunks
                    if (chunk.data && chunk.data.length > 10) {
                        addLog('output', chunk.data, currentTaskId, currentTaskTitle);
                    }
                    break;
                case 'tool_start':
                    addLog('tool_use', `Using tool: ${chunk.data?.tool}`, currentTaskId, currentTaskTitle, chunk.data);
                    break;
                case 'git_deploy':
                    addLog('git_commit', `Deployed commit ${chunk.data?.commit} to ${chunk.data?.branch || 'main'}`, chunk.data?.taskId, currentTaskTitle, chunk.data);
                    break;
                case 'error':
                    addLog('error', chunk.data?.message || 'Unknown error', currentTaskId, currentTaskTitle);
                    break;
            }
        }
        catch (e) {
            // Ignore logging errors
        }
    });
    // ========== END AGENT WORKER SYSTEM ==========
    // Serve frontend static files
    // Try multiple possible paths (check absolute first for production)
    const possiblePaths = [
        '/app/frontend/dist', // Absolute production path
        path_1.default.resolve(process.cwd(), 'frontend/dist'), // From app root
        path_1.default.resolve(__dirname, '../../frontend/dist'), // From /app/backend/dist/api
        path_1.default.resolve(__dirname, '../../../frontend/dist') // Alternative
    ];
    let frontendPath = null;
    for (const testPath of possiblePaths) {
        if (fs_1.default.existsSync(testPath) && fs_1.default.existsSync(path_1.default.join(testPath, 'index.html'))) {
            frontendPath = testPath;
            break;
        }
    }
    if (frontendPath) {
        const indexPath = path_1.default.join(frontendPath, 'index.html');
        console.log(`[STATIC] Serving frontend from: ${frontendPath}`);
        console.log(`[STATIC] Index file: ${indexPath}`);
        // Log all files in the frontend dist directory
        try {
            const files = fs_1.default.readdirSync(frontendPath);
            console.log(`[STATIC] Frontend dist contents: ${files.join(', ')}`);
            const alienPath = path_1.default.join(frontendPath, 'molt-alien.png');
            console.log(`[STATIC] Alien image exists: ${fs_1.default.existsSync(alienPath)}`);
        }
        catch (e) {
            console.error('Error listing frontend files:', e);
        }
        // Serve static files first (images, CSS, JS, etc.)
        app.use(express_1.default.static(frontendPath, {
            maxAge: '1y',
            etag: true
        }));
        // Catch-all handler: send back React's index.html file for client-side routing
        // But skip API routes and static file extensions
        app.get('*', (req, res) => {
            // Skip API routes
            if (req.originalUrl.startsWith('/api')) {
                return res.status(404).json({ error: 'Not found' });
            }
            // Skip static file extensions (they should be handled by express.static above)
            const staticExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.css', '.js', '.woff', '.woff2', '.ttf', '.eot'];
            const hasStaticExtension = staticExtensions.some(ext => req.originalUrl.toLowerCase().endsWith(ext));
            if (hasStaticExtension) {
                return res.status(404).send('Static file not found');
            }
            res.sendFile(indexPath, (err) => {
                if (err) {
                    console.error('Error serving index.html:', err);
                    res.status(500).send('Error loading application');
                }
            });
        });
    }
    else {
        console.error('[ERROR] Frontend directory not found. Tried paths:');
        possiblePaths.forEach(p => {
            console.error(`   - ${p} (exists: ${fs_1.default.existsSync(p)})`);
        });
        app.get('*', (req, res) => {
            if (req.originalUrl.startsWith('/api')) {
                return res.status(404).json({ error: 'Not found' });
            }
            res.status(503).send('Frontend not available');
        });
    }
    const server = http_1.default.createServer(app);
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
        console.log(`[SERVER] Running on http://localhost:${PORT}\n`);
    });
    blockProducer.start();
    process.on('SIGINT', () => {
        console.log('\n[SHUTDOWN] Stopping services...');
        blockProducer.stop();
        agentWorker.stop();
        db_1.db.end();
        process.exit(0);
    });
}
main().catch(console.error);
//# sourceMappingURL=server.js.map