"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentGoals = exports.GOAL_TEMPLATES = void 0;
const db_1 = require("../database/db");
const AgentMemory_1 = require("./AgentMemory");
// Predefined goal templates the agent can choose from
exports.GOAL_TEMPLATES = {
    chain_health: {
        title: 'Maintain Chain Health',
        description: 'Keep the blockchain running smoothly with optimal performance',
        type: 'long',
        priority: 0.9,
        subgoals: [
            'Monitor block production times',
            'Investigate any consensus failures',
            'Optimize transaction throughput',
            'Ensure validator availability',
        ],
    },
    security: {
        title: 'Strengthen Security',
        description: 'Continuously audit and improve chain security',
        type: 'long',
        priority: 0.85,
        subgoals: [
            'Audit staking contract',
            'Review consensus mechanism',
            'Check for vulnerabilities',
            'Document security practices',
        ],
    },
    tooling: {
        title: 'Build Developer Tools',
        description: 'Create utilities that make ClawChain easier to use',
        type: 'medium',
        priority: 0.7,
        subgoals: [
            'Build wallet utilities',
            'Create analytics dashboard',
            'Develop testing frameworks',
            'Write documentation',
        ],
    },
    optimization: {
        title: 'Optimize Performance',
        description: 'Find and fix bottlenecks in the chain',
        type: 'medium',
        priority: 0.75,
        subgoals: [
            'Profile transaction processing',
            'Optimize gas calculations',
            'Improve block production',
            'Reduce latency',
        ],
    },
    governance: {
        title: 'Improve Governance',
        description: 'Make the chain more decentralized and fair',
        type: 'long',
        priority: 0.6,
        subgoals: [
            'Propose governance improvements',
            'Review existing CIPs',
            'Analyze voting patterns',
            'Document governance processes',
        ],
    },
    documentation: {
        title: 'Improve Documentation',
        description: 'Make ClawChain easier to understand',
        type: 'short',
        priority: 0.5,
        subgoals: [
            'Document API endpoints',
            'Write getting started guide',
            'Create architecture docs',
            'Add code comments',
        ],
    },
};
const CREATE_GOALS_TABLE = `
CREATE TABLE IF NOT EXISTS agent_goals (
  id VARCHAR(64) PRIMARY KEY,
  type VARCHAR(16) NOT NULL,
  title VARCHAR(256) NOT NULL,
  description TEXT,
  status VARCHAR(32) DEFAULT 'active',
  priority FLOAT DEFAULT 0.5,
  progress INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  subgoals JSONB DEFAULT '[]',
  blockers JSONB DEFAULT '[]',
  reasoning TEXT
);

CREATE INDEX IF NOT EXISTS idx_goals_status ON agent_goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_priority ON agent_goals(priority DESC);
`;
class AgentGoalsSystem {
    constructor() {
        this.goals = new Map();
        this.initialized = false;
    }
    async initialize() {
        if (this.initialized)
            return;
        try {
            await db_1.db.exec(CREATE_GOALS_TABLE);
            await this.loadGoals();
            // Set up default long-term goals if none exist
            if (this.goals.size === 0) {
                await this.setDefaultGoals();
            }
            this.initialized = true;
            console.log('[GOALS] Goal system initialized with', this.goals.size, 'goals');
        }
        catch (error) {
            console.error('[GOALS] Failed to initialize:', error);
            await this.setDefaultGoals();
            this.initialized = true;
        }
    }
    async loadGoals() {
        try {
            const result = await db_1.db.query(`
        SELECT * FROM agent_goals 
        WHERE status IN ('active', 'in_progress')
        ORDER BY priority DESC
      `);
            for (const row of result.rows || []) {
                const goal = {
                    id: row.id,
                    type: row.type,
                    title: row.title,
                    description: row.description,
                    status: row.status,
                    priority: row.priority,
                    progress: row.progress,
                    createdAt: new Date(row.created_at),
                    updatedAt: new Date(row.updated_at),
                    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
                    subgoals: row.subgoals || [],
                    blockers: row.blockers || [],
                    reasoning: row.reasoning || '',
                };
                this.goals.set(goal.id, goal);
            }
        }
        catch (error) {
            console.log('[GOALS] Could not load goals from database');
        }
    }
    async setDefaultGoals() {
        console.log('[GOALS] Setting up default goals...');
        // Always have chain health as a goal
        await this.createGoal(exports.GOAL_TEMPLATES.chain_health.title, exports.GOAL_TEMPLATES.chain_health.description, 'long', 'Core responsibility: Keep ClawChain running smoothly', exports.GOAL_TEMPLATES.chain_health.priority, exports.GOAL_TEMPLATES.chain_health.subgoals);
        // Security is always important
        await this.createGoal(exports.GOAL_TEMPLATES.security.title, exports.GOAL_TEMPLATES.security.description, 'long', 'Security is foundational to blockchain trust', exports.GOAL_TEMPLATES.security.priority, exports.GOAL_TEMPLATES.security.subgoals);
        // Start with a tooling goal
        await this.createGoal(exports.GOAL_TEMPLATES.tooling.title, exports.GOAL_TEMPLATES.tooling.description, 'medium', 'Better tools make the chain more accessible', exports.GOAL_TEMPLATES.tooling.priority, exports.GOAL_TEMPLATES.tooling.subgoals);
    }
    // Create a new goal
    async createGoal(title, description, type, reasoning, priority = 0.5, subgoals = []) {
        const id = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const goal = {
            id,
            type,
            title,
            description,
            status: 'active',
            priority: Math.max(0, Math.min(1, priority)),
            progress: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            subgoals,
            blockers: [],
            reasoning,
        };
        this.goals.set(id, goal);
        // Persist
        try {
            await db_1.db.query(`
        INSERT INTO agent_goals (id, type, title, description, status, priority, subgoals, reasoning)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [id, type, title, description, 'active', priority, JSON.stringify(subgoals), reasoning]);
        }
        catch (error) {
            console.error('[GOALS] Failed to persist goal:', error);
        }
        // Remember creating this goal
        await AgentMemory_1.agentMemory.recordDecision(`Set new ${type}-term goal: ${title}`, reasoning);
        return goal;
    }
    // Update goal progress
    async updateProgress(goalId, progress, note) {
        const goal = this.goals.get(goalId);
        if (!goal)
            return;
        goal.progress = Math.max(0, Math.min(100, progress));
        goal.updatedAt = new Date();
        if (progress >= 100) {
            goal.status = 'completed';
            goal.completedAt = new Date();
            await AgentMemory_1.agentMemory.recordLearning(`Completed goal: ${goal.title}`, 0.8);
        }
        else if (progress > 0 && goal.status === 'active') {
            goal.status = 'in_progress';
        }
        // Persist
        try {
            await db_1.db.query(`
        UPDATE agent_goals 
        SET progress = $1, status = $2, updated_at = NOW(), completed_at = $3
        WHERE id = $4
      `, [goal.progress, goal.status, goal.completedAt, goalId]);
        }
        catch (error) {
            console.error('[GOALS] Failed to update goal:', error);
        }
        if (note) {
            await AgentMemory_1.agentMemory.recordObservation(`Goal progress (${goal.title}): ${note}`);
        }
    }
    // Add a blocker to a goal
    async addBlocker(goalId, blocker) {
        const goal = this.goals.get(goalId);
        if (!goal)
            return;
        goal.blockers.push(blocker);
        goal.updatedAt = new Date();
        await AgentMemory_1.agentMemory.recordObservation(`Blocker for "${goal.title}": ${blocker}`);
    }
    // Remove a blocker
    async removeBlocker(goalId, blocker) {
        const goal = this.goals.get(goalId);
        if (!goal)
            return;
        goal.blockers = goal.blockers.filter(b => b !== blocker);
        goal.updatedAt = new Date();
    }
    // Get all active goals
    getActiveGoals() {
        return Array.from(this.goals.values())
            .filter(g => g.status === 'active' || g.status === 'in_progress')
            .sort((a, b) => b.priority - a.priority);
    }
    // Get the current focus goal
    getCurrentFocus() {
        const inProgress = Array.from(this.goals.values())
            .filter(g => g.status === 'in_progress')
            .sort((a, b) => b.priority - a.priority);
        if (inProgress.length > 0)
            return inProgress[0];
        const active = this.getActiveGoals();
        return active[0] || null;
    }
    // Get goals by type
    getGoalsByType(type) {
        return Array.from(this.goals.values())
            .filter(g => g.type === type && (g.status === 'active' || g.status === 'in_progress'));
    }
    // Check if a task contributes to any goal
    taskContributesToGoal(taskTitle) {
        const titleLower = taskTitle.toLowerCase();
        for (const goal of this.goals.values()) {
            if (goal.status !== 'active' && goal.status !== 'in_progress')
                continue;
            // Check if task matches goal title or description
            if (goal.title.toLowerCase().includes(titleLower) ||
                goal.description.toLowerCase().includes(titleLower)) {
                return goal;
            }
            // Check subgoals
            for (const subgoal of goal.subgoals) {
                if (titleLower.includes(subgoal.toLowerCase()) ||
                    subgoal.toLowerCase().includes(titleLower)) {
                    return goal;
                }
            }
            // Keyword matching
            const goalKeywords = this.extractKeywords(goal);
            const taskKeywords = titleLower.split(/\s+/);
            const overlap = taskKeywords.filter(k => goalKeywords.has(k)).length;
            if (overlap >= 2) {
                return goal;
            }
        }
        return null;
    }
    extractKeywords(goal) {
        const text = `${goal.title} ${goal.description} ${goal.subgoals.join(' ')}`.toLowerCase();
        const words = text.split(/\s+/).filter(w => w.length > 3);
        return new Set(words);
    }
    // Agent can propose a new goal
    async proposeGoal(context) {
        // Based on context, agent might want to create a new goal
        const contextLower = context.toLowerCase();
        // Check if any template matches
        for (const [key, template] of Object.entries(exports.GOAL_TEMPLATES)) {
            const hasGoal = Array.from(this.goals.values()).some(g => g.title === template.title && g.status !== 'completed');
            if (hasGoal)
                continue;
            // Simple keyword matching
            if (contextLower.includes(key) ||
                contextLower.includes(template.title.toLowerCase())) {
                return this.createGoal(template.title, template.description, template.type, `Proposed based on context: ${context.substring(0, 100)}`, template.priority, template.subgoals);
            }
        }
        return null;
    }
    // Get a summary for the agent's context
    getSummary() {
        const active = this.getActiveGoals();
        if (active.length === 0) {
            return 'No active goals set.';
        }
        const parts = ['**Current Goals:**'];
        for (const goal of active.slice(0, 5)) {
            const statusIcon = goal.status === 'in_progress' ? '→' : '○';
            const progressBar = this.makeProgressBar(goal.progress);
            parts.push(`${statusIcon} ${goal.title} ${progressBar} (${goal.type}-term, priority: ${(goal.priority * 100).toFixed(0)}%)`);
            if (goal.blockers.length > 0) {
                parts.push(`  ⚠ Blockers: ${goal.blockers.join(', ')}`);
            }
        }
        return parts.join('\n');
    }
    makeProgressBar(progress) {
        const filled = Math.round(progress / 10);
        return `[${'█'.repeat(filled)}${'░'.repeat(10 - filled)}] ${progress}%`;
    }
    // Suggest next action based on goals
    suggestNextAction() {
        const focus = this.getCurrentFocus();
        if (!focus)
            return null;
        // Find an incomplete subgoal
        const completedSubgoals = focus.subgoals.filter(s => focus.description.toLowerCase().includes('completed') ||
            focus.progress >= 100);
        const nextSubgoal = focus.subgoals.find(s => !completedSubgoals.includes(s));
        if (nextSubgoal) {
            return {
                goal: focus,
                action: nextSubgoal,
            };
        }
        // Otherwise suggest based on goal type
        return {
            goal: focus,
            action: `Work on: ${focus.title}`,
        };
    }
}
exports.agentGoals = new AgentGoalsSystem();
//# sourceMappingURL=AgentGoals.js.map