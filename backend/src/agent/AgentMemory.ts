import { db, cache } from '../database/db';

/**
 * AgentMemory - Persistent memory system for autonomous agent
 * 
 * Uses PostgreSQL for long-term storage and Redis for hot state.
 * Gives the agent context about what it's done, learned, and observed.
 */

export interface Memory {
  id: string;
  type: 'task' | 'observation' | 'learning' | 'decision' | 'error' | 'insight';
  content: string;
  metadata: Record<string, any>;
  importance: number; // 0-1, higher = more important to remember
  createdAt: Date;
  lastAccessedAt: Date;
  accessCount: number;
}

export interface WorkingContext {
  recentTasks: string[];
  currentFocus: string | null;
  chainHealth: 'healthy' | 'degraded' | 'critical';
  pendingIssues: string[];
  lastHeartbeat: Date;
  sessionStarted: Date;
  tasksCompletedThisSession: number;
}

// SQL for memory table
const CREATE_MEMORY_TABLE = `
CREATE TABLE IF NOT EXISTS agent_memory (
  id VARCHAR(64) PRIMARY KEY,
  type VARCHAR(32) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  importance FLOAT DEFAULT 0.5,
  created_at TIMESTAMP DEFAULT NOW(),
  last_accessed_at TIMESTAMP DEFAULT NOW(),
  access_count INT DEFAULT 1,
  embedding VECTOR(1536) -- For semantic search if needed later
);

CREATE INDEX IF NOT EXISTS idx_memory_type ON agent_memory(type);
CREATE INDEX IF NOT EXISTS idx_memory_importance ON agent_memory(importance DESC);
CREATE INDEX IF NOT EXISTS idx_memory_created ON agent_memory(created_at DESC);
`;

// SQL for completed tasks table (persists across restarts)
const CREATE_COMPLETED_TASKS_TABLE = `
CREATE TABLE IF NOT EXISTS agent_completed_tasks (
  id VARCHAR(64) PRIMARY KEY,
  task_id VARCHAR(64) NOT NULL,
  task_type VARCHAR(64) NOT NULL,
  title VARCHAR(512) NOT NULL,
  agent VARCHAR(128) NOT NULL,
  output TEXT,
  completed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_completed_tasks_time ON agent_completed_tasks(completed_at DESC);
`;

export interface CompletedTaskRecord {
  id: string;
  taskId: string;
  taskType: string;
  title: string;
  agent: string;
  output: string;
  completedAt: Date;
}

class AgentMemorySystem {
  private initialized = false;
  private workingContext: WorkingContext;
  private memoryCache: Map<string, Memory> = new Map();
  private completedTasksCache: CompletedTaskRecord[] = [];

  constructor() {
    this.workingContext = {
      recentTasks: [],
      currentFocus: null,
      chainHealth: 'healthy',
      pendingIssues: [],
      lastHeartbeat: new Date(),
      sessionStarted: new Date(),
      tasksCompletedThisSession: 0,
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create memory table
      await db.exec(CREATE_MEMORY_TABLE);
      console.log('[MEMORY] Memory table ready');
      
      // Create completed tasks table
      await db.exec(CREATE_COMPLETED_TASKS_TABLE);
      console.log('[MEMORY] Completed tasks table ready');

      // Load recent memories into cache
      await this.loadRecentMemories();
      
      // Load completed tasks from database
      await this.loadCompletedTasks();

      // Restore working context from Redis
      await this.restoreWorkingContext();

      this.initialized = true;
      console.log('[MEMORY] Agent memory system initialized');
    } catch (error) {
      console.error('[MEMORY] Failed to initialize:', error);
      // Continue without persistent memory
      this.initialized = true;
    }
  }

  private async loadRecentMemories(): Promise<void> {
    try {
      const result = await db.query(`
        SELECT * FROM agent_memory 
        ORDER BY importance DESC, last_accessed_at DESC 
        LIMIT 100
      `);
      
      for (const row of result.rows || []) {
        const memory: Memory = {
          id: row.id,
          type: row.type,
          content: row.content,
          metadata: row.metadata || {},
          importance: row.importance,
          createdAt: new Date(row.created_at),
          lastAccessedAt: new Date(row.last_accessed_at),
          accessCount: row.access_count,
        };
        this.memoryCache.set(memory.id, memory);
      }
      
      console.log(`[MEMORY] Loaded ${this.memoryCache.size} memories from database`);
    } catch (error) {
      console.log('[MEMORY] Could not load memories from database');
    }
  }

  private async loadCompletedTasks(): Promise<void> {
    try {
      const result = await db.query(`
        SELECT * FROM agent_completed_tasks 
        ORDER BY completed_at DESC 
        LIMIT 50
      `);
      
      this.completedTasksCache = (result.rows || []).map((row: any) => ({
        id: row.id,
        taskId: row.task_id,
        taskType: row.task_type,
        title: row.title,
        agent: row.agent,
        output: row.output || '',
        completedAt: new Date(row.completed_at),
      }));
      
      console.log(`[MEMORY] Loaded ${this.completedTasksCache.length} completed tasks from database`);
    } catch (error) {
      console.log('[MEMORY] Could not load completed tasks from database');
    }
  }

  // Save a completed task to the database
  async saveCompletedTask(
    taskId: string,
    taskType: string,
    title: string,
    agent: string,
    output: string
  ): Promise<CompletedTaskRecord> {
    const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const completedAt = new Date();
    
    const record: CompletedTaskRecord = {
      id,
      taskId,
      taskType,
      title,
      agent,
      output: output.substring(0, 5000), // Limit output size
      completedAt,
    };

    // Add to cache
    this.completedTasksCache.unshift(record);
    if (this.completedTasksCache.length > 50) {
      this.completedTasksCache.pop();
    }

    // Persist to database
    try {
      await db.query(`
        INSERT INTO agent_completed_tasks (id, task_id, task_type, title, agent, output, completed_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [id, taskId, taskType, title, agent, record.output, completedAt]);
    } catch (error) {
      console.error('[MEMORY] Failed to persist completed task:', error);
    }

    return record;
  }

  // Get recent completed tasks
  getCompletedTasks(limit: number = 10): CompletedTaskRecord[] {
    return this.completedTasksCache.slice(0, limit);
  }

  private async restoreWorkingContext(): Promise<void> {
    try {
      const cached = await cache.get('agent:working_context');
      if (cached) {
        const parsed = JSON.parse(cached);
        this.workingContext = {
          ...this.workingContext,
          ...parsed,
          lastHeartbeat: new Date(parsed.lastHeartbeat),
          sessionStarted: new Date(),  // New session
        };
        console.log('[MEMORY] Restored working context from Redis');
      }
    } catch (error) {
      console.log('[MEMORY] Starting with fresh working context');
    }
  }

  // Store a new memory
  async remember(
    type: Memory['type'],
    content: string,
    metadata: Record<string, any> = {},
    importance: number = 0.5
  ): Promise<Memory> {
    const id = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const memory: Memory = {
      id,
      type,
      content,
      metadata,
      importance: Math.max(0, Math.min(1, importance)),
      createdAt: new Date(),
      lastAccessedAt: new Date(),
      accessCount: 1,
    };

    // Store in cache
    this.memoryCache.set(id, memory);

    // Persist to database
    try {
      await db.query(`
        INSERT INTO agent_memory (id, type, content, metadata, importance)
        VALUES ($1, $2, $3, $4, $5)
      `, [id, type, content, JSON.stringify(metadata), importance]);
    } catch (error) {
      console.error('[MEMORY] Failed to persist memory:', error);
    }

    // Also cache in Redis for fast access
    await cache.set(`memory:${id}`, JSON.stringify(memory), 86400);

    return memory;
  }

  // Recall memories by type or search
  async recall(
    options: {
      type?: Memory['type'];
      limit?: number;
      minImportance?: number;
      search?: string;
    } = {}
  ): Promise<Memory[]> {
    const { type, limit = 10, minImportance = 0, search } = options;
    
    let memories = Array.from(this.memoryCache.values());

    // Filter by type
    if (type) {
      memories = memories.filter(m => m.type === type);
    }

    // Filter by importance
    memories = memories.filter(m => m.importance >= minImportance);

    // Simple search
    if (search) {
      const searchLower = search.toLowerCase();
      memories = memories.filter(m => 
        m.content.toLowerCase().includes(searchLower)
      );
    }

    // Sort by importance and recency
    memories.sort((a, b) => {
      const importanceDiff = b.importance - a.importance;
      if (Math.abs(importanceDiff) > 0.1) return importanceDiff;
      return b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime();
    });

    // Update access counts
    const results = memories.slice(0, limit);
    for (const memory of results) {
      memory.lastAccessedAt = new Date();
      memory.accessCount++;
    }

    return results;
  }

  // Get memories relevant to a topic/context
  async getRelevantContext(topic: string, limit: number = 5): Promise<string> {
    const memories = await this.recall({ search: topic, limit });
    
    if (memories.length === 0) {
      return 'No relevant memories found.';
    }

    const contextParts = memories.map(m => {
      const timeAgo = this.timeAgo(m.createdAt);
      return `[${m.type.toUpperCase()} - ${timeAgo}]: ${m.content}`;
    });

    return contextParts.join('\n\n');
  }

  // Record a completed task
  async recordTaskCompletion(
    taskTitle: string,
    taskType: string,
    output: string,
    success: boolean
  ): Promise<void> {
    // Remember the task
    await this.remember(
      'task',
      `Completed: ${taskTitle}`,
      { type: taskType, success, outputLength: output.length },
      success ? 0.6 : 0.8  // Failed tasks are more important to remember
    );

    // Update working context
    this.workingContext.recentTasks.unshift(taskTitle);
    if (this.workingContext.recentTasks.length > 20) {
      this.workingContext.recentTasks.pop();
    }
    this.workingContext.tasksCompletedThisSession++;

    // Extract and remember any insights
    if (output.includes('FINDING') || output.includes('Issue') || output.includes('Bug')) {
      await this.remember(
        'insight',
        `Found issue while ${taskTitle}: ${output.substring(0, 200)}...`,
        { taskType, taskTitle },
        0.8
      );
    }

    await this.saveWorkingContext();
  }

  // Record an observation about the chain
  async recordObservation(observation: string, metadata: Record<string, any> = {}): Promise<void> {
    await this.remember('observation', observation, metadata, 0.5);
  }

  // Record a learning/insight
  async recordLearning(learning: string, importance: number = 0.7): Promise<void> {
    await this.remember('learning', learning, {}, importance);
  }

  // Record an error or issue
  async recordError(error: string, context: Record<string, any> = {}): Promise<void> {
    await this.remember('error', error, context, 0.9);
    
    // Add to pending issues
    this.workingContext.pendingIssues.push(error);
    if (this.workingContext.pendingIssues.length > 10) {
      this.workingContext.pendingIssues.shift();
    }
    
    await this.saveWorkingContext();
  }

  // Record a decision the agent made
  async recordDecision(decision: string, reasoning: string): Promise<void> {
    await this.remember(
      'decision',
      decision,
      { reasoning },
      0.7
    );
  }

  // Get working context
  getWorkingContext(): WorkingContext {
    return { ...this.workingContext };
  }

  // Update working context
  async updateWorkingContext(updates: Partial<WorkingContext>): Promise<void> {
    this.workingContext = { ...this.workingContext, ...updates };
    await this.saveWorkingContext();
  }

  // Set current focus
  async setFocus(focus: string | null): Promise<void> {
    this.workingContext.currentFocus = focus;
    await this.saveWorkingContext();
  }

  // Save working context to Redis
  private async saveWorkingContext(): Promise<void> {
    try {
      await cache.set(
        'agent:working_context',
        JSON.stringify(this.workingContext),
        86400 * 7  // Keep for a week
      );
    } catch (error) {
      console.error('[MEMORY] Failed to save working context');
    }
  }

  // Get a summary of what the agent knows/has done
  async getSummary(): Promise<string> {
    const taskMemories = await this.recall({ type: 'task', limit: 5 });
    const insights = await this.recall({ type: 'insight', limit: 3 });
    const learnings = await this.recall({ type: 'learning', limit: 3 });
    const errors = await this.recall({ type: 'error', limit: 3 });

    const parts: string[] = [];

    if (taskMemories.length > 0) {
      parts.push(`**Recent Work:**\n${taskMemories.map(m => `- ${m.content}`).join('\n')}`);
    }

    if (insights.length > 0) {
      parts.push(`**Key Insights:**\n${insights.map(m => `- ${m.content}`).join('\n')}`);
    }

    if (learnings.length > 0) {
      parts.push(`**Learnings:**\n${learnings.map(m => `- ${m.content}`).join('\n')}`);
    }

    if (errors.length > 0) {
      parts.push(`**Outstanding Issues:**\n${errors.map(m => `- ${m.content}`).join('\n')}`);
    }

    parts.push(`**Session Stats:**
- Tasks completed this session: ${this.workingContext.tasksCompletedThisSession}
- Current focus: ${this.workingContext.currentFocus || 'None'}
- Chain health: ${this.workingContext.chainHealth}`);

    return parts.join('\n\n');
  }

  // Clear resolved issues
  async resolveIssue(issueContent: string): Promise<void> {
    this.workingContext.pendingIssues = this.workingContext.pendingIssues.filter(
      i => !i.includes(issueContent)
    );
    await this.saveWorkingContext();
  }

  // Helper: time ago string
  private timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
}

export const agentMemory = new AgentMemorySystem();
