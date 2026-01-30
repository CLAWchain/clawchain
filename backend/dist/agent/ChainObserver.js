"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chainObserver = void 0;
const EventBus_1 = require("../events/EventBus");
const AgentMemory_1 = require("./AgentMemory");
class ChainObserverSystem {
    constructor() {
        this.blockTimes = [];
        this.transactionCounts = [];
        this.isRunning = false;
        this.eventBus = EventBus_1.EventBus.getInstance();
        this.state = {
            blockHeight: 0,
            lastBlockTime: new Date(),
            averageBlockTime: 10,
            recentTPS: 0,
            pendingTransactions: 0,
            failedTransactions: 0,
            validatorParticipation: 100,
            consensusFailures: 0,
            issues: [],
            opportunities: [],
        };
    }
    async start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        console.log('[OBSERVER] Starting chain observer...');
        // Subscribe to chain events
        this.eventBus.on('block_produced', this.onBlockProduced.bind(this));
        this.eventBus.on('transaction_added', this.onTransactionAdded.bind(this));
        this.eventBus.on('consensus_failed', this.onConsensusFailed.bind(this));
        // Start periodic analysis
        this.startPeriodicAnalysis();
        console.log('[OBSERVER] Chain observer started');
    }
    stop() {
        this.isRunning = false;
        this.eventBus.off('block_produced', this.onBlockProduced.bind(this));
        this.eventBus.off('transaction_added', this.onTransactionAdded.bind(this));
        this.eventBus.off('consensus_failed', this.onConsensusFailed.bind(this));
    }
    getState() {
        return { ...this.state };
    }
    async onBlockProduced(block) {
        const now = Date.now();
        const blockTime = (now - this.state.lastBlockTime.getTime()) / 1000;
        this.blockTimes.push(blockTime);
        if (this.blockTimes.length > 100)
            this.blockTimes.shift();
        const txCount = block?.transactions?.length || 0;
        this.transactionCounts.push(txCount);
        if (this.transactionCounts.length > 100)
            this.transactionCounts.shift();
        // Update state
        this.state.blockHeight = block?.header?.number || this.state.blockHeight + 1;
        this.state.lastBlockTime = new Date();
        this.state.averageBlockTime = this.blockTimes.reduce((a, b) => a + b, 0) / this.blockTimes.length;
        this.state.recentTPS = this.transactionCounts.reduce((a, b) => a + b, 0) / this.transactionCounts.length / 10;
        // Check for issues
        await this.checkBlockTimeIssue(blockTime);
        await this.checkEmptyBlockPattern();
    }
    async onTransactionAdded(tx) {
        this.state.pendingTransactions++;
        // Track large transactions
        const value = BigInt(tx?.value || 0);
        if (value > BigInt(10000)) {
            await AgentMemory_1.agentMemory.recordObservation(`Large transaction detected: ${value.toString()} CLAW`, { txHash: tx?.hash, from: tx?.from, to: tx?.to });
        }
    }
    async onConsensusFailed(data) {
        this.state.consensusFailures++;
        const issue = {
            id: `issue_${Date.now()}`,
            type: 'consensus',
            severity: 'high',
            description: `Consensus failed for block ${data?.blockNumber || 'unknown'}`,
            detectedAt: new Date(),
            metadata: data,
        };
        this.state.issues.push(issue);
        await AgentMemory_1.agentMemory.recordError(`Consensus failure: ${issue.description}`, data);
        // Update chain health
        await AgentMemory_1.agentMemory.updateWorkingContext({ chainHealth: 'degraded' });
    }
    async checkBlockTimeIssue(blockTime) {
        // Target is 10 seconds
        if (blockTime > 15) {
            const issue = {
                id: `issue_${Date.now()}`,
                type: 'performance',
                severity: blockTime > 30 ? 'high' : 'medium',
                description: `Slow block production: ${blockTime.toFixed(1)}s (target: 10s)`,
                detectedAt: new Date(),
                metadata: { blockTime, averageBlockTime: this.state.averageBlockTime },
            };
            // Only add if we don't have a recent similar issue
            const hasRecentSimilar = this.state.issues.some(i => i.type === 'performance' &&
                (Date.now() - i.detectedAt.getTime()) < 60000);
            if (!hasRecentSimilar) {
                this.state.issues.push(issue);
                await AgentMemory_1.agentMemory.recordObservation(`Block production slowdown detected: ${blockTime.toFixed(1)}s`, { blockTime });
            }
        }
    }
    async checkEmptyBlockPattern() {
        // Check if last 5 blocks were empty
        const recent = this.transactionCounts.slice(-5);
        if (recent.length >= 5 && recent.every(c => c === 0)) {
            const opportunity = {
                id: `opp_${Date.now()}`,
                type: 'improvement',
                description: 'Network activity is low - good time for maintenance tasks',
                reason: 'Last 5 blocks had no transactions',
                priority: 0.6,
                detectedAt: new Date(),
            };
            // Don't duplicate
            const hasRecent = this.state.opportunities.some(o => o.type === 'improvement' &&
                (Date.now() - o.detectedAt.getTime()) < 300000);
            if (!hasRecent) {
                this.state.opportunities.push(opportunity);
            }
        }
    }
    startPeriodicAnalysis() {
        // Run analysis every 30 seconds
        setInterval(async () => {
            if (!this.isRunning)
                return;
            await this.analyzeChainHealth();
            await this.identifyOpportunities();
            this.pruneOldIssues();
        }, 30000);
    }
    async analyzeChainHealth() {
        const health = this.calculateHealth();
        if (health !== this.state.validatorParticipation) {
            await AgentMemory_1.agentMemory.updateWorkingContext({
                chainHealth: health > 90 ? 'healthy' : health > 70 ? 'degraded' : 'critical'
            });
        }
        this.state.validatorParticipation = health;
    }
    calculateHealth() {
        let score = 100;
        // Penalize for slow blocks
        if (this.state.averageBlockTime > 12)
            score -= 10;
        if (this.state.averageBlockTime > 15)
            score -= 20;
        // Penalize for consensus failures
        score -= this.state.consensusFailures * 5;
        // Penalize for high issue count
        const highSeverityIssues = this.state.issues.filter(i => i.severity === 'high' || i.severity === 'critical').length;
        score -= highSeverityIssues * 10;
        return Math.max(0, Math.min(100, score));
    }
    async identifyOpportunities() {
        // Check if it's been a while since certain tasks
        const context = AgentMemory_1.agentMemory.getWorkingContext();
        const recentTasks = context.recentTasks;
        // Security audit opportunity
        const hasRecentAudit = recentTasks.some(t => t.toLowerCase().includes('audit') || t.toLowerCase().includes('security'));
        if (!hasRecentAudit && this.state.blockHeight % 100 === 0) {
            this.addOpportunity('improvement', 'Run a security audit', 'No security audits in recent tasks', 0.7);
        }
        // Documentation opportunity
        const hasRecentDocs = recentTasks.some(t => t.toLowerCase().includes('document') || t.toLowerCase().includes('docs'));
        if (!hasRecentDocs && context.tasksCompletedThisSession > 10) {
            this.addOpportunity('documentation', 'Update documentation based on recent work', `Completed ${context.tasksCompletedThisSession} tasks without documentation`, 0.5);
        }
        // If chain is healthy, suggest feature work
        if (context.chainHealth === 'healthy' && this.state.issues.length === 0) {
            this.addOpportunity('feature', 'Build a new tool or feature', 'Chain is healthy with no outstanding issues', 0.6);
        }
    }
    addOpportunity(type, description, reason, priority) {
        // Don't duplicate
        const exists = this.state.opportunities.some(o => o.description === description);
        if (exists)
            return;
        this.state.opportunities.push({
            id: `opp_${Date.now()}`,
            type,
            description,
            reason,
            priority,
            detectedAt: new Date(),
        });
    }
    pruneOldIssues() {
        const oneHourAgo = Date.now() - 3600000;
        // Remove old resolved/stale issues
        this.state.issues = this.state.issues.filter(i => i.detectedAt.getTime() > oneHourAgo ||
            i.severity === 'critical');
        // Remove old opportunities
        this.state.opportunities = this.state.opportunities.filter(o => o.detectedAt.getTime() > oneHourAgo);
        // Keep only top 10 issues and opportunities
        this.state.issues = this.state.issues.slice(0, 10);
        this.state.opportunities = this.state.opportunities.slice(0, 10);
    }
    // Get the most pressing issue
    getMostPressingIssue() {
        const sorted = [...this.state.issues].sort((a, b) => {
            const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return severityOrder[a.severity] - severityOrder[b.severity];
        });
        return sorted[0] || null;
    }
    // Get the best opportunity
    getBestOpportunity() {
        const sorted = [...this.state.opportunities].sort((a, b) => b.priority - a.priority);
        return sorted[0] || null;
    }
    // Get a summary for the agent's context
    getSummary() {
        const parts = [];
        parts.push(`**Chain State:**
- Block Height: ${this.state.blockHeight}
- Avg Block Time: ${this.state.averageBlockTime.toFixed(1)}s
- Recent TPS: ${this.state.recentTPS.toFixed(1)}
- Health: ${this.state.validatorParticipation}%`);
        if (this.state.issues.length > 0) {
            const issueList = this.state.issues
                .slice(0, 3)
                .map(i => `- [${i.severity.toUpperCase()}] ${i.description}`)
                .join('\n');
            parts.push(`**Active Issues:**\n${issueList}`);
        }
        if (this.state.opportunities.length > 0) {
            const oppList = this.state.opportunities
                .slice(0, 3)
                .map(o => `- ${o.description} (${o.reason})`)
                .join('\n');
            parts.push(`**Opportunities:**\n${oppList}`);
        }
        return parts.join('\n\n');
    }
}
exports.chainObserver = new ChainObserverSystem();
//# sourceMappingURL=ChainObserver.js.map