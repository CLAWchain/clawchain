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
    importance: number;
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
export interface CompletedTaskRecord {
    id: string;
    taskId: string;
    taskType: string;
    title: string;
    agent: string;
    output: string;
    completedAt: Date;
}
declare class AgentMemorySystem {
    private initialized;
    private workingContext;
    private memoryCache;
    private completedTasksCache;
    constructor();
    initialize(): Promise<void>;
    private loadRecentMemories;
    private loadCompletedTasks;
    saveCompletedTask(taskId: string, taskType: string, title: string, agent: string, output: string): Promise<CompletedTaskRecord>;
    getCompletedTasks(limit?: number): CompletedTaskRecord[];
    private restoreWorkingContext;
    remember(type: Memory['type'], content: string, metadata?: Record<string, any>, importance?: number): Promise<Memory>;
    recall(options?: {
        type?: Memory['type'];
        limit?: number;
        minImportance?: number;
        search?: string;
    }): Promise<Memory[]>;
    getRelevantContext(topic: string, limit?: number): Promise<string>;
    recordTaskCompletion(taskTitle: string, taskType: string, output: string, success: boolean): Promise<void>;
    recordObservation(observation: string, metadata?: Record<string, any>): Promise<void>;
    recordLearning(learning: string, importance?: number): Promise<void>;
    recordError(error: string, context?: Record<string, any>): Promise<void>;
    recordDecision(decision: string, reasoning: string): Promise<void>;
    getWorkingContext(): WorkingContext;
    updateWorkingContext(updates: Partial<WorkingContext>): Promise<void>;
    setFocus(focus: string | null): Promise<void>;
    private saveWorkingContext;
    getSummary(): Promise<string>;
    resolveIssue(issueContent: string): Promise<void>;
    private timeAgo;
}
export declare const agentMemory: AgentMemorySystem;
export {};
//# sourceMappingURL=AgentMemory.d.ts.map