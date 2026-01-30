/**
 * Task Backlog - A massive list of real development tasks for Claw to work through
 * These tasks will keep the agent building and committing for 24+ hours
 */
export interface BacklogTask {
    id: string;
    title: string;
    description: string;
    type: 'build' | 'fix' | 'test' | 'audit' | 'docs' | 'refactor' | 'feature';
    priority: number;
    estimatedMinutes: number;
    tags: string[];
}
export declare const TASK_BACKLOG: BacklogTask[];
export declare const getTotalEstimatedTime: () => {
    minutes: number;
    hours: number;
    days: number;
};
export declare const getTasksByPriority: () => BacklogTask[];
export declare const getTasksByType: (type: BacklogTask["type"]) => BacklogTask[];
export declare const getNextBacklogTask: () => BacklogTask | null;
export declare const markBacklogTaskComplete: (taskId: string) => void;
export declare const getBacklogProgress: () => {
    completed: number;
    total: number;
    percent: number;
};
//# sourceMappingURL=TaskBacklog.d.ts.map