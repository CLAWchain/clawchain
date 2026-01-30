import { ChainIssue, ChainOpportunity } from './ChainObserver';
import { Goal } from './AgentGoals';
import { Task } from './TaskGenerator';
/**
 * AgentBrain - The decision-making core
 *
 * Combines memory, goals, and chain observations to decide what to work on.
 * This is what makes the agent feel autonomous and intelligent.
 */
export interface Decision {
    action: 'work_on_task' | 'investigate_issue' | 'pursue_opportunity' | 'reflect' | 'propose_goal';
    task?: Task;
    issue?: ChainIssue;
    opportunity?: ChainOpportunity;
    goal?: Goal;
    reasoning: string;
    priority: number;
    context: string;
}
declare class AgentBrainSystem {
    private taskGenerator;
    private lastDecisionTime;
    private decisionHistory;
    private reflectionCount;
    constructor();
    /**
     * Main decision function - called by AgentWorker to get next action
     */
    decideNextAction(): Promise<Decision>;
    /**
     * The thinking process - gather context, consider options, decide
     */
    private think;
    /**
     * Convert thought process into actionable decision
     */
    private formulateDecision;
    /**
     * Create a task to investigate an issue
     */
    private createTaskForIssue;
    /**
     * Create a task to work toward a goal
     */
    private createTaskForGoal;
    /**
     * Create a task to pursue an opportunity
     */
    private createTaskForOpportunity;
    /**
     * Create a reflection/planning task
     */
    private createReflectionTask;
    /**
     * Check if it's time for reflection
     */
    private shouldReflect;
    /**
     * Find areas that haven't been worked on recently
     */
    private findNeglectedAreas;
    /**
     * Categorize a task title into an area
     */
    private categorizeTask;
    /**
     * Select appropriate agent for goal type
     */
    private selectAgentForGoal;
    /**
     * Select appropriate agent for opportunity type
     */
    private selectAgentForOpportunity;
    /**
     * Get brain state for debugging/display
     */
    getState(): {
        lastDecision: Decision | null;
        recentDecisions: string[];
        reflectionCount: number;
    };
    /**
     * Get a summary for context
     */
    getSummary(): string;
}
export declare const agentBrain: AgentBrainSystem;
export {};
//# sourceMappingURL=AgentBrain.d.ts.map