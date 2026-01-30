import { EventEmitter } from 'events';
import { Task } from './TaskGenerator';
import { Decision } from './AgentBrain';
export declare const agentEvents: EventEmitter<[never]>;
interface AgentState {
    isWorking: boolean;
    currentTask: Task | null;
    currentOutput: string;
    completedTasks: Array<{
        task: Task;
        output: string;
        completedAt: Date;
    }>;
    currentDecision: Decision | null;
    heartbeatCount: number;
    brainActive: boolean;
}
declare class AgentWorker {
    private state;
    private taskGenerator;
    private isRunning;
    private currentAbortController;
    private heartbeatInterval;
    private useBrain;
    constructor();
    getState(): AgentState;
    private broadcast;
    private delay;
    private initializeBrain;
    private startHeartbeat;
    private getNextAction;
    private streamTask;
    private streamTaskWithTools;
    private generateCodeForTask;
    private toPascalCase;
    private simulateStream;
    private sleep;
    start(): Promise<void>;
    stop(): void;
}
export declare const agentWorker: AgentWorker;
export {};
//# sourceMappingURL=AgentWorker.d.ts.map