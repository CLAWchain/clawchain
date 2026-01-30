declare const logsRouter: import("express-serve-static-core").Router;
export interface LogEntry {
    id: string;
    timestamp: Date;
    type: 'task_start' | 'task_complete' | 'output' | 'tool_use' | 'git_commit' | 'error' | 'system';
    taskId?: string;
    taskTitle?: string;
    content: string;
    metadata?: any;
}
export declare function initializeLogsTable(): Promise<void>;
export declare function addLog(type: LogEntry['type'], content: string, taskId?: string, taskTitle?: string, metadata?: any): LogEntry;
export { logsRouter };
//# sourceMappingURL=logs.d.ts.map