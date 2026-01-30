import { Task } from './TaskGenerator';
export type TaskSourceType = 'chain_event' | 'code_error' | 'github_issue' | 'cip_proposal' | 'todo_comment' | 'dependency' | 'performance' | 'security' | 'scheduled';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export interface SourceTask {
    id: string;
    source: TaskSourceType;
    title: string;
    description: string;
    priority: TaskPriority;
    context: Record<string, any>;
    createdAt: Date;
    expiresAt?: Date;
}
export declare class TaskSources {
    private projectRoot;
    private pendingTasks;
    private processedIds;
    constructor(projectRoot?: string);
    private setupEventListeners;
    private addChainEventTask;
    scanTodoComments(): Promise<SourceTask[]>;
    scanLintErrors(): Promise<SourceTask[]>;
    scanTestFailures(): Promise<SourceTask[]>;
    scanDependencies(): Promise<SourceTask[]>;
    scanGitHubIssues(): Promise<SourceTask[]>;
    scanCipProposals(): Promise<SourceTask[]>;
    collectAllTasks(): Promise<SourceTask[]>;
    getNextTask(): Promise<Task | null>;
    private convertBacklogTask;
    private convertToAgentTask;
    markCompleted(taskId: string): void;
    getPendingCount(): number;
}
export declare const taskSources: TaskSources;
//# sourceMappingURL=TaskSources.d.ts.map