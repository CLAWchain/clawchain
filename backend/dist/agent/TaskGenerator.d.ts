export interface Task {
    id: string;
    type: string;
    title: string;
    prompt: string;
    agent: string;
    priority?: number;
    context?: Record<string, any>;
}
export declare class TaskGenerator {
    private taskIndex;
    private allTasks;
    constructor();
    private generateTaskPool;
    private shuffleTasks;
    getNextTask(): Task;
    getTaskOfType(type: string): Task | null;
    getTaskTypes(): string[];
}
//# sourceMappingURL=TaskGenerator.d.ts.map