"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentBrain = void 0;
const AgentMemory_1 = require("./AgentMemory");
const ChainObserver_1 = require("./ChainObserver");
const AgentGoals_1 = require("./AgentGoals");
const TaskGenerator_1 = require("./TaskGenerator");
class AgentBrainSystem {
    constructor() {
        this.lastDecisionTime = new Date(0);
        this.decisionHistory = [];
        this.reflectionCount = 0;
        this.taskGenerator = new TaskGenerator_1.TaskGenerator();
    }
    /**
     * Main decision function - called by AgentWorker to get next action
     */
    async decideNextAction() {
        const thought = await this.think();
        // Record the decision
        await AgentMemory_1.agentMemory.recordDecision(thought.decision, thought.considerations.join('; '));
        this.lastDecisionTime = new Date();
        // Parse thought into decision
        const decision = await this.formulateDecision(thought);
        this.decisionHistory.push(decision);
        // Keep history manageable
        if (this.decisionHistory.length > 50) {
            this.decisionHistory.shift();
        }
        return decision;
    }
    /**
     * The thinking process - gather context, consider options, decide
     */
    async think() {
        const observations = [];
        const considerations = [];
        // 1. Observe chain state
        const chainState = ChainObserver_1.chainObserver.getState();
        observations.push(`Chain at block ${chainState.blockHeight}, ${chainState.recentTPS.toFixed(1)} TPS`);
        // 2. Check for critical issues
        const pressingIssue = ChainObserver_1.chainObserver.getMostPressingIssue();
        if (pressingIssue) {
            observations.push(`Active issue: [${pressingIssue.severity}] ${pressingIssue.description}`);
            if (pressingIssue.severity === 'critical' || pressingIssue.severity === 'high') {
                considerations.push('High priority issue needs attention');
            }
        }
        // 3. Check opportunities
        const opportunity = ChainObserver_1.chainObserver.getBestOpportunity();
        if (opportunity) {
            observations.push(`Opportunity: ${opportunity.description}`);
        }
        // 4. Review goals
        const currentGoal = AgentGoals_1.agentGoals.getCurrentFocus();
        if (currentGoal) {
            observations.push(`Current goal: ${currentGoal.title} (${currentGoal.progress}%)`);
            const suggestion = AgentGoals_1.agentGoals.suggestNextAction();
            if (suggestion) {
                considerations.push(`Goal suggests: ${suggestion.action}`);
            }
        }
        // 5. Check memory for patterns
        const context = AgentMemory_1.agentMemory.getWorkingContext();
        observations.push(`Session: ${context.tasksCompletedThisSession} tasks completed`);
        if (context.pendingIssues.length > 0) {
            considerations.push(`${context.pendingIssues.length} pending issues from memory`);
        }
        // 6. Consider what hasn't been done recently
        const recentTaskTypes = new Set(context.recentTasks.map(t => this.categorizeTask(t)));
        const neglectedAreas = this.findNeglectedAreas(recentTaskTypes);
        if (neglectedAreas.length > 0) {
            considerations.push(`Neglected areas: ${neglectedAreas.join(', ')}`);
        }
        // 7. Make decision based on priorities
        let decision;
        let confidence;
        if (pressingIssue && (pressingIssue.severity === 'critical' || pressingIssue.severity === 'high')) {
            decision = `Address critical issue: ${pressingIssue.description}`;
            confidence = 0.95;
        }
        else if (currentGoal && currentGoal.status === 'in_progress' && currentGoal.blockers.length === 0) {
            const suggestion = AgentGoals_1.agentGoals.suggestNextAction();
            decision = suggestion ? `Continue goal work: ${suggestion.action}` : `Work on: ${currentGoal.title}`;
            confidence = 0.8;
        }
        else if (opportunity && opportunity.priority > 0.7) {
            decision = `Pursue opportunity: ${opportunity.description}`;
            confidence = 0.75;
        }
        else if (neglectedAreas.length > 0 && Math.random() > 0.5) {
            decision = `Address neglected area: ${neglectedAreas[0]}`;
            confidence = 0.6;
        }
        else if (this.shouldReflect()) {
            decision = 'Take time to reflect and plan';
            confidence = 0.7;
        }
        else {
            decision = 'Continue with next queued task';
            confidence = 0.5;
        }
        return { observations, considerations, decision, confidence };
    }
    /**
     * Convert thought process into actionable decision
     */
    async formulateDecision(thought) {
        const { decision: decisionText, confidence, observations, considerations } = thought;
        // Build context string for the task
        const contextParts = [
            '## Current Situation',
            ...observations.map(o => `- ${o}`),
            '',
            '## Considerations',
            ...considerations.map(c => `- ${c}`),
            '',
            `## Decision (${(confidence * 100).toFixed(0)}% confidence)`,
            decisionText,
        ];
        const context = contextParts.join('\n');
        // Parse decision into action
        if (decisionText.includes('critical issue') || decisionText.includes('Address')) {
            const issue = ChainObserver_1.chainObserver.getMostPressingIssue();
            if (issue) {
                return {
                    action: 'investigate_issue',
                    issue,
                    reasoning: decisionText,
                    priority: 0.95,
                    context,
                    task: this.createTaskForIssue(issue),
                };
            }
        }
        if (decisionText.includes('goal work') || decisionText.includes('Continue goal')) {
            const goal = AgentGoals_1.agentGoals.getCurrentFocus();
            if (goal) {
                return {
                    action: 'work_on_task',
                    goal,
                    reasoning: decisionText,
                    priority: 0.8,
                    context,
                    task: this.createTaskForGoal(goal),
                };
            }
        }
        if (decisionText.includes('opportunity')) {
            const opp = ChainObserver_1.chainObserver.getBestOpportunity();
            if (opp) {
                return {
                    action: 'pursue_opportunity',
                    opportunity: opp,
                    reasoning: decisionText,
                    priority: 0.75,
                    context,
                    task: this.createTaskForOpportunity(opp),
                };
            }
        }
        if (decisionText.includes('reflect')) {
            this.reflectionCount++;
            return {
                action: 'reflect',
                reasoning: decisionText,
                priority: 0.6,
                context,
                task: this.createReflectionTask(),
            };
        }
        // Default: get from task generator but augment with context
        const task = this.taskGenerator.getNextTask();
        // Check if this task contributes to a goal
        const contributingGoal = AgentGoals_1.agentGoals.taskContributesToGoal(task.title);
        return {
            action: 'work_on_task',
            task,
            goal: contributingGoal || undefined,
            reasoning: decisionText,
            priority: contributingGoal ? 0.7 : 0.5,
            context,
        };
    }
    /**
     * Create a task to investigate an issue
     */
    createTaskForIssue(issue) {
        return {
            id: `issue_${issue.id}`,
            type: `investigate_${issue.type}`,
            title: `Investigating: ${issue.description}`,
            agent: 'CLAW ANALYST',
            priority: issue.severity === 'critical' ? 1 : issue.severity === 'high' ? 0.9 : 0.7,
            prompt: `A ${issue.severity} priority issue has been detected on ClawChain:

**Issue:** ${issue.description}
**Type:** ${issue.type}
**Detected:** ${issue.detectedAt.toISOString()}

Your task:
1. Analyze the root cause of this issue
2. Assess the impact on chain operations
3. Propose solutions or mitigations
4. Recommend immediate actions if needed

Think through this systematically and explain your analysis.`,
        };
    }
    /**
     * Create a task to work toward a goal
     */
    createTaskForGoal(goal) {
        const suggestion = AgentGoals_1.agentGoals.suggestNextAction();
        const action = suggestion?.action || goal.subgoals[0] || goal.title;
        return {
            id: `goal_${goal.id}_${Date.now()}`,
            type: `goal_${goal.type}`,
            title: `Goal Work: ${action}`,
            agent: this.selectAgentForGoal(goal),
            priority: goal.priority,
            prompt: `You are working toward your goal: **${goal.title}**

**Description:** ${goal.description}
**Progress:** ${goal.progress}%
**Current Focus:** ${action}

${goal.blockers.length > 0 ? `**Blockers:** ${goal.blockers.join(', ')}\n` : ''}

Your task:
1. Make meaningful progress on: ${action}
2. Document what you accomplish
3. Identify any new blockers or insights
4. Suggest next steps

Show your work and explain your thinking.`,
        };
    }
    /**
     * Create a task to pursue an opportunity
     */
    createTaskForOpportunity(opp) {
        return {
            id: `opp_${opp.id}`,
            type: `opportunity_${opp.type}`,
            title: `Opportunity: ${opp.description}`,
            agent: this.selectAgentForOpportunity(opp),
            priority: opp.priority,
            prompt: `An opportunity has been identified:

**Opportunity:** ${opp.description}
**Reason:** ${opp.reason}
**Type:** ${opp.type}

Your task:
1. Evaluate this opportunity
2. Take action if appropriate
3. Document any outcomes
4. Note any follow-up work needed

Be proactive and make the most of this opportunity.`,
        };
    }
    /**
     * Create a reflection/planning task
     */
    createReflectionTask() {
        return {
            id: `reflect_${Date.now()}`,
            type: 'reflection',
            title: 'Self-Reflection & Planning',
            agent: 'CLAW ARCHITECT',
            priority: 0.6,
            prompt: `Take a moment to reflect on your recent work and plan ahead.

**Questions to consider:**
1. What have you accomplished recently?
2. Are your current goals still the right priorities?
3. Have you noticed any patterns or recurring issues?
4. What should you focus on next?
5. Are there any new goals you should set?

Review your progress, identify improvements, and plan your next steps.
Be honest and thoughtful in your self-assessment.`,
        };
    }
    /**
     * Check if it's time for reflection
     */
    shouldReflect() {
        // Reflect every ~10 tasks
        const context = AgentMemory_1.agentMemory.getWorkingContext();
        return context.tasksCompletedThisSession > 0 &&
            context.tasksCompletedThisSession % 10 === 0 &&
            this.reflectionCount < 3; // Don't over-reflect
    }
    /**
     * Find areas that haven't been worked on recently
     */
    findNeglectedAreas(recentTypes) {
        const allAreas = ['security', 'performance', 'documentation', 'tooling', 'governance'];
        return allAreas.filter(area => !recentTypes.has(area));
    }
    /**
     * Categorize a task title into an area
     */
    categorizeTask(title) {
        const lower = title.toLowerCase();
        if (lower.includes('audit') || lower.includes('security'))
            return 'security';
        if (lower.includes('analyz') || lower.includes('performance') || lower.includes('optim'))
            return 'performance';
        if (lower.includes('document') || lower.includes('docs'))
            return 'documentation';
        if (lower.includes('build') || lower.includes('tool') || lower.includes('utility'))
            return 'tooling';
        if (lower.includes('propos') || lower.includes('governance') || lower.includes('vote'))
            return 'governance';
        return 'general';
    }
    /**
     * Select appropriate agent for goal type
     */
    selectAgentForGoal(goal) {
        switch (goal.title.toLowerCase()) {
            case 'maintain chain health': return 'CLAW VALIDATOR';
            case 'strengthen security': return 'CLAW REVIEWER';
            case 'build developer tools': return 'CLAW ARCHITECT';
            case 'optimize performance': return 'CLAW ANALYST';
            case 'improve governance': return 'CLAW CONSENSUS';
            case 'improve documentation': return 'CLAW DOCS';
            default: return 'CLAW ARCHITECT';
        }
    }
    /**
     * Select appropriate agent for opportunity type
     */
    selectAgentForOpportunity(opp) {
        switch (opp.type) {
            case 'optimization': return 'CLAW ANALYST';
            case 'feature': return 'CLAW ARCHITECT';
            case 'improvement': return 'CLAW DEVELOPER';
            case 'documentation': return 'CLAW DOCS';
            default: return 'CLAW ARCHITECT';
        }
    }
    /**
     * Get brain state for debugging/display
     */
    getState() {
        return {
            lastDecision: this.decisionHistory[this.decisionHistory.length - 1] || null,
            recentDecisions: this.decisionHistory.slice(-5).map(d => d.reasoning),
            reflectionCount: this.reflectionCount,
        };
    }
    /**
     * Get a summary for context
     */
    getSummary() {
        const state = this.getState();
        const parts = ['**Agent Brain Status:**'];
        if (state.lastDecision) {
            parts.push(`Last decision: ${state.lastDecision.reasoning}`);
            parts.push(`Action type: ${state.lastDecision.action}`);
        }
        parts.push(`Reflection count: ${state.reflectionCount}`);
        parts.push(`Decision history: ${this.decisionHistory.length} decisions`);
        return parts.join('\n');
    }
}
exports.agentBrain = new AgentBrainSystem();
//# sourceMappingURL=AgentBrain.js.map