import { EventBus } from '../events/EventBus';
import { agentMemory } from './AgentMemory';

/**
 * ChainObserver - Watches chain events and surfaces issues/opportunities
 * 
 * Monitors block production, transactions, errors, and performance.
 * Provides the agent with awareness of what's happening on the chain.
 */

export interface ChainState {
  blockHeight: number;
  lastBlockTime: Date;
  averageBlockTime: number;
  recentTPS: number;
  pendingTransactions: number;
  failedTransactions: number;
  validatorParticipation: number;
  consensusFailures: number;
  issues: ChainIssue[];
  opportunities: ChainOpportunity[];
}

export interface ChainIssue {
  id: string;
  type: 'performance' | 'consensus' | 'security' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  metadata: Record<string, any>;
}

export interface ChainOpportunity {
  id: string;
  type: 'optimization' | 'feature' | 'improvement' | 'documentation';
  description: string;
  reason: string;
  priority: number;
  detectedAt: Date;
}

class ChainObserverSystem {
  private eventBus: EventBus;
  private state: ChainState;
  private blockTimes: number[] = [];
  private transactionCounts: number[] = [];
  private isRunning = false;

  constructor() {
    this.eventBus = EventBus.getInstance();
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

  async start(): Promise<void> {
    if (this.isRunning) return;
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

  stop(): void {
    this.isRunning = false;
    this.eventBus.off('block_produced', this.onBlockProduced.bind(this));
    this.eventBus.off('transaction_added', this.onTransactionAdded.bind(this));
    this.eventBus.off('consensus_failed', this.onConsensusFailed.bind(this));
  }

  getState(): ChainState {
    return { ...this.state };
  }

  private async onBlockProduced(block: any): Promise<void> {
    const now = Date.now();
    const blockTime = (now - this.state.lastBlockTime.getTime()) / 1000;
    
    this.blockTimes.push(blockTime);
    if (this.blockTimes.length > 100) this.blockTimes.shift();

    const txCount = block?.transactions?.length || 0;
    this.transactionCounts.push(txCount);
    if (this.transactionCounts.length > 100) this.transactionCounts.shift();

    // Update state
    this.state.blockHeight = block?.header?.height || block?.header?.number || this.state.blockHeight + 1;
    this.state.lastBlockTime = new Date();
    this.state.averageBlockTime = this.blockTimes.reduce((a, b) => a + b, 0) / this.blockTimes.length;
    this.state.recentTPS = this.transactionCounts.reduce((a, b) => a + b, 0) / this.transactionCounts.length / 10;

    // Check for issues
    await this.checkBlockTimeIssue(blockTime);
    await this.checkEmptyBlockPattern();
    await this.checkGasUsage(block);
  }

  private async onTransactionAdded(tx: any): Promise<void> {
    this.state.pendingTransactions++;
    
    // Track large transactions
    const value = BigInt(tx?.value || 0);
    if (value > BigInt(10000)) {
      await agentMemory.recordObservation(
        `Large transaction detected: ${value.toString()} CLAW`,
        { txHash: tx?.hash, from: tx?.from, to: tx?.to }
      );
    }
  }

  private async onConsensusFailed(data: any): Promise<void> {
    this.state.consensusFailures++;
    
    const issue: ChainIssue = {
      id: `issue_${Date.now()}`,
      type: 'consensus',
      severity: 'high',
      description: `Consensus failed for block ${data?.blockNumber || 'unknown'}`,
      detectedAt: new Date(),
      metadata: data,
    };
    
    this.state.issues.push(issue);
    await agentMemory.recordError(`Consensus failure: ${issue.description}`, data);

    // Update chain health
    await agentMemory.updateWorkingContext({ chainHealth: 'degraded' });
  }

  private async checkBlockTimeIssue(blockTime: number): Promise<void> {
    // Target is 10 seconds
    if (blockTime > 15) {
      const issue: ChainIssue = {
        id: `issue_${Date.now()}`,
        type: 'performance',
        severity: blockTime > 30 ? 'high' : 'medium',
        description: `Slow block production: ${blockTime.toFixed(1)}s (target: 10s)`,
        detectedAt: new Date(),
        metadata: { blockTime, averageBlockTime: this.state.averageBlockTime },
      };
      
      // Only add if we don't have a recent similar issue
      const hasRecentSimilar = this.state.issues.some(
        i => i.type === 'performance' && 
             (Date.now() - i.detectedAt.getTime()) < 60000
      );
      
      if (!hasRecentSimilar) {
        this.state.issues.push(issue);
        await agentMemory.recordObservation(
          `Block production slowdown detected: ${blockTime.toFixed(1)}s`,
          { blockTime }
        );
        
        // Emit event for task generation
        this.eventBus.emit('chain_performance_issue', {
          type: 'slow_blocks',
          blockTime,
          averageBlockTime: this.state.averageBlockTime,
          severity: issue.severity
        });
      }
    }
  }

  // Check for high gas usage patterns
  private async checkGasUsage(block: any): Promise<void> {
    const gasUsed = BigInt(block?.header?.gasUsed || '0');
    const gasLimit = BigInt(block?.header?.gasLimit || '30000000');
    const utilizationPercent = Number((gasUsed * 100n) / gasLimit);

    // If consistently high gas usage (>80%), suggest optimization
    if (utilizationPercent > 80) {
      const issue: ChainIssue = {
        id: `gas_${Date.now()}`,
        type: 'performance',
        severity: utilizationPercent > 95 ? 'high' : 'medium',
        description: `High gas utilization: ${utilizationPercent}%`,
        detectedAt: new Date(),
        metadata: { gasUsed: gasUsed.toString(), gasLimit: gasLimit.toString(), utilizationPercent }
      };

      const hasRecent = this.state.issues.some(
        i => i.description.includes('gas utilization') && 
             (Date.now() - i.detectedAt.getTime()) < 300000
      );

      if (!hasRecent) {
        this.state.issues.push(issue);
        
        // Emit event for task generation - optimization task
        this.eventBus.emit('chain_performance_issue', {
          type: 'high_gas',
          gasUsed: gasUsed.toString(),
          gasLimit: gasLimit.toString(),
          utilizationPercent,
          severity: issue.severity
        });
      }
    }
  }

  private async checkEmptyBlockPattern(): Promise<void> {
    // Check if last 5 blocks were empty
    const recent = this.transactionCounts.slice(-5);
    if (recent.length >= 5 && recent.every(c => c === 0)) {
      const opportunity: ChainOpportunity = {
        id: `opp_${Date.now()}`,
        type: 'improvement',
        description: 'Network activity is low - good time for maintenance tasks',
        reason: 'Last 5 blocks had no transactions',
        priority: 0.6,
        detectedAt: new Date(),
      };
      
      // Don't duplicate
      const hasRecent = this.state.opportunities.some(
        o => o.type === 'improvement' && 
             (Date.now() - o.detectedAt.getTime()) < 300000
      );
      
      if (!hasRecent) {
        this.state.opportunities.push(opportunity);
      }
    }
  }

  private startPeriodicAnalysis(): void {
    // Run analysis every 30 seconds
    setInterval(async () => {
      if (!this.isRunning) return;
      
      await this.analyzeChainHealth();
      await this.identifyOpportunities();
      this.pruneOldIssues();
    }, 30000);
  }

  private async analyzeChainHealth(): Promise<void> {
    const health = this.calculateHealth();
    
    if (health !== this.state.validatorParticipation) {
      await agentMemory.updateWorkingContext({
        chainHealth: health > 90 ? 'healthy' : health > 70 ? 'degraded' : 'critical'
      });
    }
    
    this.state.validatorParticipation = health;
  }

  private calculateHealth(): number {
    let score = 100;
    
    // Penalize for slow blocks
    if (this.state.averageBlockTime > 12) score -= 10;
    if (this.state.averageBlockTime > 15) score -= 20;
    
    // Penalize for consensus failures
    score -= this.state.consensusFailures * 5;
    
    // Penalize for high issue count
    const highSeverityIssues = this.state.issues.filter(i => 
      i.severity === 'high' || i.severity === 'critical'
    ).length;
    score -= highSeverityIssues * 10;
    
    return Math.max(0, Math.min(100, score));
  }

  private async identifyOpportunities(): Promise<void> {
    // Check if it's been a while since certain tasks
    const context = agentMemory.getWorkingContext();
    const recentTasks = context.recentTasks;
    
    // Security audit opportunity
    const hasRecentAudit = recentTasks.some(t => 
      t.toLowerCase().includes('audit') || t.toLowerCase().includes('security')
    );
    if (!hasRecentAudit && this.state.blockHeight % 100 === 0) {
      this.addOpportunity(
        'improvement',
        'Run a security audit',
        'No security audits in recent tasks',
        0.7
      );
    }
    
    // Documentation opportunity
    const hasRecentDocs = recentTasks.some(t => 
      t.toLowerCase().includes('document') || t.toLowerCase().includes('docs')
    );
    if (!hasRecentDocs && context.tasksCompletedThisSession > 10) {
      this.addOpportunity(
        'documentation',
        'Update documentation based on recent work',
        `Completed ${context.tasksCompletedThisSession} tasks without documentation`,
        0.5
      );
    }

    // If chain is healthy, suggest feature work
    if (context.chainHealth === 'healthy' && this.state.issues.length === 0) {
      this.addOpportunity(
        'feature',
        'Build a new tool or feature',
        'Chain is healthy with no outstanding issues',
        0.6
      );
    }
  }

  private addOpportunity(
    type: ChainOpportunity['type'],
    description: string,
    reason: string,
    priority: number
  ): void {
    // Don't duplicate
    const exists = this.state.opportunities.some(o => 
      o.description === description
    );
    if (exists) return;

    this.state.opportunities.push({
      id: `opp_${Date.now()}`,
      type,
      description,
      reason,
      priority,
      detectedAt: new Date(),
    });
  }

  private pruneOldIssues(): void {
    const oneHourAgo = Date.now() - 3600000;
    
    // Remove old resolved/stale issues
    this.state.issues = this.state.issues.filter(i => 
      i.detectedAt.getTime() > oneHourAgo ||
      i.severity === 'critical'
    );

    // Remove old opportunities
    this.state.opportunities = this.state.opportunities.filter(o =>
      o.detectedAt.getTime() > oneHourAgo
    );

    // Keep only top 10 issues and opportunities
    this.state.issues = this.state.issues.slice(0, 10);
    this.state.opportunities = this.state.opportunities.slice(0, 10);
  }

  // Get the most pressing issue
  getMostPressingIssue(): ChainIssue | null {
    const sorted = [...this.state.issues].sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
    return sorted[0] || null;
  }

  // Get the best opportunity
  getBestOpportunity(): ChainOpportunity | null {
    const sorted = [...this.state.opportunities].sort((a, b) => 
      b.priority - a.priority
    );
    return sorted[0] || null;
  }

  // Get a summary for the agent's context
  getSummary(): string {
    const parts: string[] = [];
    
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

export const chainObserver = new ChainObserverSystem();
