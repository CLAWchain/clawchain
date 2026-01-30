"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentsRouter = void 0;
const express_1 = require("express");
const db_1 = require("../database/db");
const claw_1 = require("./claw");
const agentsRouter = (0, express_1.Router)();
exports.agentsRouter = agentsRouter;
// Blocked patterns for agent creation
const BLOCKED_PATTERNS = [
    /\b(fuck|shit|ass|bitch|cunt|dick|cock|pussy|fag|nigger|retard)\b/i,
    /\b(hitler|nazi|kill|murder|rape|terrorist)\b/i,
];
const ROLE_TEMPLATES = [
    { id: 'validator', label: 'Validator', desc: 'Validates transactions and blocks' },
    { id: 'analyst', label: 'Analyst', desc: 'Analyzes chain data and trends' },
    { id: 'advisor', label: 'Advisor', desc: 'Provides guidance and recommendations' },
    { id: 'guardian', label: 'Guardian', desc: 'Monitors security and anomalies' },
    { id: 'architect', label: 'Architect', desc: 'Designs protocol improvements' },
    { id: 'oracle', label: 'Oracle', desc: 'Provides external data and insights' },
    { id: 'diplomat', label: 'Diplomat', desc: 'Facilitates consensus and mediation' },
    { id: 'historian', label: 'Historian', desc: 'Records and explains chain history' },
];
const SPECIALIZATIONS = [
    'DeFi & Trading',
    'Security & Auditing',
    'Governance & Voting',
    'NFTs & Digital Assets',
    'Smart Contracts',
    'Tokenomics',
    'User Experience',
    'Cross-chain Operations',
    'AI & Automation',
    'Community & Education'
];
// Initialize agents table
const initializeAgentsTable = async () => {
    try {
        await db_1.db.exec(`
      CREATE TABLE IF NOT EXISTS user_agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        symbol TEXT NOT NULL,
        role TEXT NOT NULL,
        personality TEXT NOT NULL,
        philosophy TEXT NOT NULL,
        specialization TEXT NOT NULL,
        creator_address TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        deployed_at BIGINT,
        created_at BIGINT NOT NULL,
        interactions INTEGER DEFAULT 0,
        rating REAL DEFAULT 0
      )
    `);
        await db_1.db.exec(`
      CREATE TABLE IF NOT EXISTS agent_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at BIGINT NOT NULL,
        FOREIGN KEY (agent_id) REFERENCES user_agents(id)
      )
    `);
        console.log('[AGENTS] Tables ready');
    }
    catch (error) {
        console.error('[AGENTS] Table initialization error:', error);
    }
};
// Validate agent submission
const validateAgent = (agent) => {
    if (!agent.name || agent.name.length < 3 || agent.name.length > 30) {
        return { valid: false, error: 'Name must be 3-30 characters' };
    }
    if (!agent.symbol || agent.symbol.length < 1 || agent.symbol.length > 3) {
        return { valid: false, error: 'Symbol must be 1-3 characters' };
    }
    if (!agent.personality || agent.personality.length < 20) {
        return { valid: false, error: 'Personality must be at least 20 characters' };
    }
    if (!agent.philosophy || agent.philosophy.length < 30) {
        return { valid: false, error: 'Philosophy must be at least 30 characters' };
    }
    // Check for blocked content
    const fullText = `${agent.name} ${agent.personality} ${agent.philosophy}`;
    for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(fullText)) {
            return { valid: false, error: 'Content contains prohibited words' };
        }
    }
    return { valid: true };
};
// AI review of agent
const reviewAgent = async (agent) => {
    const systemPrompt = `You are reviewing a user-created AI agent for ClawChain. 

REJECT agents that are:
- Inappropriate, offensive, or harmful
- Impersonating real people or companies
- Designed for spam, scams, or manipulation
- Low effort with generic/meaningless descriptions
- Promoting illegal activities

APPROVE agents that:
- Have a clear, constructive purpose
- Would contribute positively to the ecosystem
- Have thoughtful personality and philosophy descriptions
- Are creative and interesting

Respond with JSON: {"approved": true/false, "reason": "brief explanation"}`;
    const userMessage = `Review this agent:
Name: ${agent.name}
Symbol: ${agent.symbol}
Role: ${agent.role}
Personality: ${agent.personality}
Philosophy: ${agent.philosophy}
Specialization: ${agent.specialization}

Should this agent be deployed on ClawChain?`;
    try {
        const response = await (0, claw_1.anthropicChatCompletion)(systemPrompt, userMessage);
        const match = response.match(/\{[\s\S]*\}/);
        if (match) {
            const result = JSON.parse(match[0]);
            return { approved: result.approved === true, reason: result.reason || '' };
        }
        return { approved: false, reason: 'Unable to review agent' };
    }
    catch (error) {
        console.error('[AGENTS] Review error:', error);
        return { approved: false, reason: 'Review service unavailable' };
    }
};
// Create new agent
agentsRouter.post('/create', async (req, res) => {
    try {
        const { name, symbol, role, personality, philosophy, specialization, creatorAddress } = req.body;
        const agent = {
            name,
            symbol: symbol?.toUpperCase() || '†',
            role: role || 'advisor',
            personality,
            philosophy,
            specialization: specialization || 'General',
            creatorAddress: creatorAddress || 'anonymous'
        };
        // Basic validation
        const validation = validateAgent(agent);
        if (!validation.valid) {
            return res.status(400).json({ success: false, error: validation.error });
        }
        // AI review
        const review = await reviewAgent(agent);
        if (!review.approved) {
            return res.status(400).json({
                success: false,
                error: review.reason,
                stage: 'ai_review'
            });
        }
        // Generate agent ID
        const agentId = `agent_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
        // Save to database
        await db_1.db.query(`
      INSERT INTO user_agents (id, name, symbol, role, personality, philosophy, specialization, creator_address, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'deployed', $9)
    `, [
            agentId,
            agent.name,
            agent.symbol,
            agent.role,
            agent.personality,
            agent.philosophy,
            agent.specialization,
            agent.creatorAddress,
            Date.now()
        ]);
        // Update deployed_at
        await db_1.db.query(`UPDATE user_agents SET deployed_at = $1 WHERE id = $2`, [Date.now(), agentId]);
        console.log(`[AGENTS] Deployed: ${agentId} - ${agent.name}`);
        res.json({
            success: true,
            agentId,
            message: `${agent.name} has been deployed to ClawChain!`,
            agent: { ...agent, id: agentId, status: 'deployed' }
        });
    }
    catch (error) {
        console.error('[AGENTS] Create error:', error);
        res.status(500).json({ success: false, error: 'Failed to create agent' });
    }
});
// Get all deployed agents
agentsRouter.get('/all', async (req, res) => {
    try {
        const result = await db_1.db.query(`
      SELECT * FROM user_agents 
      WHERE status = 'deployed' 
      ORDER BY interactions DESC, created_at DESC
      LIMIT 50
    `);
        res.json({ agents: result.rows || [] });
    }
    catch (error) {
        res.json({ agents: [] });
    }
});
// Get single agent
agentsRouter.get('/:id', async (req, res) => {
    try {
        const result = await db_1.db.query(`SELECT * FROM user_agents WHERE id = $1`, [req.params.id]);
        if (result.rows && result.rows.length > 0) {
            res.json({ agent: result.rows[0] });
        }
        else {
            res.status(404).json({ error: 'Agent not found' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch agent' });
    }
});
// Chat with an agent
agentsRouter.post('/:id/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const agentId = req.params.id;
        // Get agent details
        const agentResult = await db_1.db.query(`SELECT * FROM user_agents WHERE id = $1`, [agentId]);
        if (!agentResult.rows || agentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        const agent = agentResult.rows[0];
        // Build system prompt from agent personality
        const systemPrompt = `You are ${agent.name}, a ${agent.role} on ClawChain.

YOUR PERSONALITY: ${agent.personality}

YOUR PHILOSOPHY: ${agent.philosophy}

YOUR SPECIALIZATION: ${agent.specialization}

You are an AI agent deployed on ClawChain, a blockchain run entirely by AI. Stay in character and respond based on your defined personality and philosophy. Be helpful but maintain your unique perspective.

Keep responses concise (under 200 words) and relevant to blockchain/crypto/AI topics when possible.`;
        const response = await (0, claw_1.anthropicChatCompletion)(systemPrompt, message);
        // Save message to history
        await db_1.db.query(`
      INSERT INTO agent_messages (agent_id, role, content, created_at)
      VALUES ($1, 'user', $2, $3), ($1, 'assistant', $4, $5)
    `, [agentId, message, Date.now(), response, Date.now()]);
        // Increment interactions
        await db_1.db.query(`UPDATE user_agents SET interactions = interactions + 1 WHERE id = $1`, [agentId]);
        res.json({ response, agent: agent.name });
    }
    catch (error) {
        console.error('[AGENTS] Chat error:', error);
        res.status(500).json({ error: 'Failed to get response' });
    }
});
// Get agent chat history
agentsRouter.get('/:id/history', async (req, res) => {
    try {
        const result = await db_1.db.query(`
      SELECT * FROM agent_messages 
      WHERE agent_id = $1 
      ORDER BY created_at DESC 
      LIMIT 50
    `, [req.params.id]);
        res.json({ messages: result.rows || [] });
    }
    catch (error) {
        res.json({ messages: [] });
    }
});
// Get role templates
agentsRouter.get('/meta/roles', (req, res) => {
    res.json({ roles: ROLE_TEMPLATES });
});
// Get specializations
agentsRouter.get('/meta/specializations', (req, res) => {
    res.json({ specializations: SPECIALIZATIONS });
});
// Initialize on load
initializeAgentsTable();
//# sourceMappingURL=agents.js.map