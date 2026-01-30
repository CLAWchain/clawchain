import { db, cache } from '../database/db';
import { agentMemory } from './AgentMemory';

/**
 * AgentGoals - Self-directed goal system
 * 
 * Allows the agent to set, track, and achieve its own objectives.
 * Goals can be short-term (tasks), medium-term (projects), or long-term (visions).
 */

export interface Goal {
  id: string;
  type: 'short' | 'medium' | 'long';
  title: string;
  description: string;
  status: 'active' | 'in_progress' | 'completed' | 'abandoned';
  priority: number; // 0-1
  progress: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  subgoals: string[];
  blockers: string[];
  reasoning: string; // Why the agent set this goal
}

// Predefined goal templates the agent can choose from
export const GOAL_TEMPLATES = {
  chain_health: {
    title: 'Maintain Chain Health',
    description: 'Keep the blockchain running smoothly with optimal performance',
    type: 'long' as const,
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
    type: 'long' as const,
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
    type: 'medium' as const,
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
    type: 'medium' as const,
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
    type: 'long' as const,
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
    type: 'short' as const,
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
  private goals: Map<string, Goal> = new Map();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await db.exec(CREATE_GOALS_TABLE);
      await this.loadGoals();
      
      // Set up default long-term goals if none exist
      if (this.goals.size === 0) {
        await this.setDefaultGoals();
      }

      this.initialized = true;
      console.log('[GOALS] Goal system initialized with', this.goals.size, 'goals');
    } catch (error) {
      console.error('[GOALS] Failed to initialize:', error);
      await this.setDefaultGoals();
      this.initialized = true;
    }
  }

  private async loadGoals(): Promise<void> {
    try {
      const result = await db.query(`
        SELECT * FROM agent_goals 
        WHERE status IN ('active', 'in_progress')
        ORDER BY priority DESC
      `);

      for (const row of result.rows || []) {
        const goal: Goal = {
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
    } catch (error) {
      console.log('[GOALS] Could not load goals from database');
    }
  }

  private async setDefaultGoals(): Promise<void> {
    console.log('[GOALS] Setting up default goals...');
    
    // Always have chain health as a goal
    await this.createGoal(
      GOAL_TEMPLATES.chain_health.title,
      GOAL_TEMPLATES.chain_health.description,
      'long',
      'Core responsibility: Keep ClawChain running smoothly',
      GOAL_TEMPLATES.chain_health.priority,
      GOAL_TEMPLATES.chain_health.subgoals
    );

    // Security is always important
    await this.createGoal(
      GOAL_TEMPLATES.security.title,
      GOAL_TEMPLATES.security.description,
      'long',
      'Security is foundational to blockchain trust',
      GOAL_TEMPLATES.security.priority,
      GOAL_TEMPLATES.security.subgoals
    );

    // Start with a tooling goal
    await this.createGoal(
      GOAL_TEMPLATES.tooling.title,
      GOAL_TEMPLATES.tooling.description,
      'medium',
      'Better tools make the chain more accessible',
      GOAL_TEMPLATES.tooling.priority,
      GOAL_TEMPLATES.tooling.subgoals
    );
  }

  // Create a new goal
  async createGoal(
    title: string,
    description: string,
    type: Goal['type'],
    reasoning: string,
    priority: number = 0.5,
    subgoals: string[] = []
  ): Promise<Goal> {
    const id = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const goal: Goal = {
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
      await db.query(`
        INSERT INTO agent_goals (id, type, title, description, status, priority, subgoals, reasoning)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [id, type, title, description, 'active', priority, JSON.stringify(subgoals), reasoning]);
    } catch (error) {
      console.error('[GOALS] Failed to persist goal:', error);
    }

    // Remember creating this goal
    await agentMemory.recordDecision(
      `Set new ${type}-term goal: ${title}`,
      reasoning
    );

    return goal;
  }

  // Update goal progress
  async updateProgress(goalId: string, progress: number, note?: string): Promise<void> {
    const goal = this.goals.get(goalId);
    if (!goal) return;

    goal.progress = Math.max(0, Math.min(100, progress));
    goal.updatedAt = new Date();

    if (progress >= 100) {
      goal.status = 'completed';
      goal.completedAt = new Date();
      await agentMemory.recordLearning(`Completed goal: ${goal.title}`, 0.8);
    } else if (progress > 0 && goal.status === 'active') {
      goal.status = 'in_progress';
    }

    // Persist
    try {
      await db.query(`
        UPDATE agent_goals 
        SET progress = $1, status = $2, updated_at = NOW(), completed_at = $3
        WHERE id = $4
      `, [goal.progress, goal.status, goal.completedAt, goalId]);
    } catch (error) {
      console.error('[GOALS] Failed to update goal:', error);
    }

    if (note) {
      await agentMemory.recordObservation(`Goal progress (${goal.title}): ${note}`);
    }
  }

  // Add a blocker to a goal
  async addBlocker(goalId: string, blocker: string): Promise<void> {
    const goal = this.goals.get(goalId);
    if (!goal) return;

    goal.blockers.push(blocker);
    goal.updatedAt = new Date();

    await agentMemory.recordObservation(`Blocker for "${goal.title}": ${blocker}`);
  }

  // Remove a blocker
  async removeBlocker(goalId: string, blocker: string): Promise<void> {
    const goal = this.goals.get(goalId);
    if (!goal) return;

    goal.blockers = goal.blockers.filter(b => b !== blocker);
    goal.updatedAt = new Date();
  }

  // Get all active goals
  getActiveGoals(): Goal[] {
    return Array.from(this.goals.values())
      .filter(g => g.status === 'active' || g.status === 'in_progress')
      .sort((a, b) => b.priority - a.priority);
  }

  // Get the current focus goal
  getCurrentFocus(): Goal | null {
    const inProgress = Array.from(this.goals.values())
      .filter(g => g.status === 'in_progress')
      .sort((a, b) => b.priority - a.priority);
    
    if (inProgress.length > 0) return inProgress[0];

    const active = this.getActiveGoals();
    return active[0] || null;
  }

  // Get goals by type
  getGoalsByType(type: Goal['type']): Goal[] {
    return Array.from(this.goals.values())
      .filter(g => g.type === type && (g.status === 'active' || g.status === 'in_progress'));
  }

  // Check if a task contributes to any goal
  taskContributesToGoal(taskTitle: string): Goal | null {
    const titleLower = taskTitle.toLowerCase();
    
    for (const goal of this.goals.values()) {
      if (goal.status !== 'active' && goal.status !== 'in_progress') continue;

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

  private extractKeywords(goal: Goal): Set<string> {
    const text = `${goal.title} ${goal.description} ${goal.subgoals.join(' ')}`.toLowerCase();
    const words = text.split(/\s+/).filter(w => w.length > 3);
    return new Set(words);
  }

  // Agent can propose a new goal
  async proposeGoal(context: string): Promise<Goal | null> {
    // Based on context, agent might want to create a new goal
    const contextLower = context.toLowerCase();
    
    // Check if any template matches
    for (const [key, template] of Object.entries(GOAL_TEMPLATES)) {
      const hasGoal = Array.from(this.goals.values()).some(
        g => g.title === template.title && g.status !== 'completed'
      );
      
      if (hasGoal) continue;

      // Simple keyword matching
      if (contextLower.includes(key) || 
          contextLower.includes(template.title.toLowerCase())) {
        return this.createGoal(
          template.title,
          template.description,
          template.type,
          `Proposed based on context: ${context.substring(0, 100)}`,
          template.priority,
          template.subgoals
        );
      }
    }

    return null;
  }

  // Get a summary for the agent's context
  getSummary(): string {
    const active = this.getActiveGoals();
    
    if (active.length === 0) {
      return 'No active goals set.';
    }

    const parts: string[] = ['**Current Goals:**'];
    
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

  private makeProgressBar(progress: number): string {
    const filled = Math.round(progress / 10);
    return `[${'█'.repeat(filled)}${'░'.repeat(10 - filled)}] ${progress}%`;
  }

  // Suggest next action based on goals
  suggestNextAction(): { goal: Goal; action: string } | null {
    const focus = this.getCurrentFocus();
    if (!focus) return null;

    // Find an incomplete subgoal
    const completedSubgoals = focus.subgoals.filter(s => 
      focus.description.toLowerCase().includes('completed') ||
      focus.progress >= 100
    );

    const nextSubgoal = focus.subgoals.find(s => 
      !completedSubgoals.includes(s)
    );

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

export const agentGoals = new AgentGoalsSystem();
