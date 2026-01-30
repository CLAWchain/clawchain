export { agentWorker, agentEvents } from './AgentWorker';
export { TaskGenerator } from './TaskGenerator';
export type { Task } from './TaskGenerator';

// Brain components
export { agentMemory } from './AgentMemory';
export { chainObserver } from './ChainObserver';
export { agentGoals } from './AgentGoals';
export { agentBrain } from './AgentBrain';
export { agentExecutor, AGENT_TOOLS } from './AgentExecutor';
export { gitIntegration } from './GitIntegration';
export { taskSources } from './TaskSources';
export { ciMonitor } from './CIMonitor';
export { browserAutomation, BROWSER_TOOLS } from './BrowserAutomation';
export { skillManager } from './SkillManager';

// Types
export type { Memory, WorkingContext, CompletedTaskRecord } from './AgentMemory';
export type { ChainState, ChainIssue, ChainOpportunity } from './ChainObserver';
export type { Goal } from './AgentGoals';
export type { Decision } from './AgentBrain';
export type { ExecutionResult, FileResult, GitResult } from './AgentExecutor';
export type { GitOperationResult, BranchInfo, PullRequestInfo, CommitInfo } from './GitIntegration';
export type { SourceTask, TaskSourceType, TaskPriority } from './TaskSources';
export type { TestResult, TestFailure, BuildResult, LintResult, LintIssue } from './CIMonitor';
export type { BrowserResult, PageInfo, ElementInfo } from './BrowserAutomation';
export type { Skill, SkillTool, SkillScript, SkillTrigger, SkillResult } from './SkillManager';
