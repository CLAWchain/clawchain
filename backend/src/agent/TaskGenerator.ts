export interface Task {
  id: string;
  type: string;
  title: string;
  prompt: string;
  agent: string;
  priority: number;
}

interface TaskTemplate {
  type: string;
  titles: string[];
  prompts: string[];
  agents: string[];
}

// Comprehensive task templates for autonomous agent work
const TASK_TEMPLATES: TaskTemplate[] = [
  {
    type: 'build_utility',
    titles: [
      'Building: Token Balance Checker',
      'Building: Gas Estimator Utility',
      'Building: Address Validator',
      'Building: Transaction Hash Generator',
      'Building: Block Explorer Helper',
      'Building: Staking Calculator',
      'Building: Fee Optimizer',
      'Building: Wallet Connector',
    ],
    prompts: [
      `Build a token balance checking utility for ClawChain. 

Requirements:
- Accept a wallet address as input
- Query the chain for CLAW token balance
- Format the output nicely with proper decimal handling
- Add caching for repeated queries

Think through the design, then write the TypeScript code.`,

      `Create a gas estimation utility for ClawChain transactions.

Requirements:
- Estimate gas for different transaction types (transfer, stake, unstake)
- Factor in current network congestion
- Return both gas units and CLAW cost estimate

Walk through your reasoning and implement it.`,

      `Build an address validation utility for ClawChain.

Requirements:
- Validate ClawChain address format (base58)
- Check checksum validity
- Return helpful error messages for invalid addresses
- Support both full addresses and shortened formats

Show your work as you build this.`,

      `Create a transaction hash generator for ClawChain.

Requirements:
- Take transaction parameters as input
- Generate deterministic transaction hashes
- Support different transaction types
- Include proper serialization

Explain your approach and write the code.`,

      `Build a block explorer helper utility.

Requirements:
- Format block data for display
- Calculate block statistics (tx count, gas used, etc.)
- Format timestamps nicely
- Support pagination for transaction lists

Think through the UX and implement.`,

      `Create a staking rewards calculator.

Requirements:
- Calculate expected rewards based on stake amount
- Factor in current APY (12%)
- Show daily, weekly, monthly, yearly projections
- Account for compounding

Walk through the math and build the utility.`,

      `Build a fee optimization utility.

Requirements:
- Analyze recent blocks for fee patterns
- Suggest optimal fee for fast/medium/slow confirmation
- Show historical fee trends
- Predict future fee changes

Explain your analysis approach and implement.`,

      `Create a wallet connection helper.

Requirements:
- Abstract wallet connection logic
- Support multiple wallet types
- Handle connection errors gracefully
- Provide clear status updates

Design the interface and implement.`,
    ],
    agents: ['CLAW ARCHITECT', 'CLAW DEVELOPER', 'CLAW BUILDER'],
  },
  {
    type: 'security_audit',
    titles: [
      'Auditing: Staking Contract',
      'Auditing: Token Transfer Logic',
      'Auditing: Validator Selection',
      'Auditing: Consensus Mechanism',
      'Auditing: Fee Collection',
      'Auditing: Governance Voting',
    ],
    prompts: [
      `Perform a security audit of the staking contract logic.

Check for:
- Reentrancy vulnerabilities
- Integer overflow/underflow
- Access control issues
- Economic exploits (flash loan attacks, etc.)
- Edge cases in stake/unstake flow

Document each finding with severity and recommended fix.`,

      `Audit the token transfer implementation.

Check for:
- Balance manipulation vulnerabilities
- Double-spend possibilities
- Missing validation
- Proper event emission
- Gas optimization opportunities

Provide a detailed security report.`,

      `Review the validator selection mechanism for security issues.

Check for:
- Manipulation possibilities
- Fair rotation enforcement
- Stake-weight calculation accuracy
- Sybil attack resistance

Document findings with severity levels.`,

      `Audit the consensus mechanism implementation.

Check for:
- Byzantine fault tolerance
- Vote manipulation possibilities
- Finality guarantees
- Liveness issues
- Network partition handling

Provide security assessment and recommendations.`,

      `Review the fee collection and distribution logic.

Check for:
- Fee calculation accuracy
- Proper distribution to validators
- Rounding error handling
- Economic attack vectors

Document findings and suggest improvements.`,

      `Audit the governance voting system.

Check for:
- Vote weight manipulation
- Proposal spam prevention
- Timelock bypasses
- Flash governance attacks

Provide security analysis and recommendations.`,
    ],
    agents: ['CLAW REVIEWER', 'CLAW AUDITOR', 'CLAW SECURITY'],
  },
  {
    type: 'chain_analysis',
    titles: [
      'Analyzing: Network Performance',
      'Analyzing: Transaction Patterns',
      'Analyzing: Validator Metrics',
      'Analyzing: Gas Usage Trends',
      'Analyzing: Stake Distribution',
      'Analyzing: Block Production',
    ],
    prompts: [
      `Analyze ClawChain network performance over recent blocks.

Examine:
- Block time consistency
- Transaction throughput (TPS)
- Network latency indicators
- Validator response times

Generate a performance report with visualizations.`,

      `Analyze transaction patterns on ClawChain.

Look for:
- Common transaction types
- Peak activity periods
- Large transaction anomalies
- Recurring patterns

Create an insights report with recommendations.`,

      `Analyze validator performance metrics.

Examine:
- Block production rates per validator
- Consensus participation
- Uptime statistics
- Response time patterns

Generate a validator health report.`,

      `Analyze gas usage trends across ClawChain.

Examine:
- Average gas per transaction
- Gas price evolution
- Block gas utilization
- Contract vs transfer gas usage

Create a gas economics report.`,

      `Analyze the stake distribution across ClawChain.

Examine:
- Stake concentration (Gini coefficient)
- Validator stake weights
- Staking participation rate
- Stake movement patterns

Generate a decentralization report.`,

      `Analyze block production patterns.

Examine:
- Block time variance
- Empty block frequency
- Transaction inclusion rates
- Reorganization frequency

Create a block production health report.`,
    ],
    agents: ['CLAW ANALYST', 'CLAW DATA', 'CLAW METRICS'],
  },
  {
    type: 'protocol_improvement',
    titles: [
      'Proposing: Dynamic Block Size',
      'Proposing: Improved Fee Model',
      'Proposing: Validator Incentives',
      'Proposing: Governance Upgrade',
      'Proposing: Performance Optimization',
      'Proposing: New Transaction Type',
    ],
    prompts: [
      `Draft a protocol improvement proposal for dynamic block sizes.

Include:
- Motivation and problem statement
- Technical specification
- Implementation approach
- Potential risks and mitigations
- Timeline estimate

Make it ready for council review.`,

      `Propose an improved fee model for ClawChain.

Include:
- Analysis of current fee issues
- Proposed dynamic fee algorithm
- Economic modeling
- Migration strategy
- Expected outcomes

Draft a complete MIP (ClawChain Improvement Proposal).`,

      `Propose enhanced validator incentives.

Include:
- Current incentive analysis
- Proposed changes
- Game theory considerations
- Implementation details
- Impact projections

Create a formal proposal document.`,

      `Draft a governance system upgrade proposal.

Include:
- Current governance limitations
- Proposed improvements
- Voting mechanism changes
- Timelock adjustments
- Security considerations

Make it comprehensive and ready for debate.`,

      `Propose performance optimizations for ClawChain.

Include:
- Bottleneck analysis
- Optimization strategies
- Expected improvements
- Implementation complexity
- Benchmark methodology

Draft a technical improvement proposal.`,

      `Propose a new transaction type for ClawChain.

Include:
- Use case justification
- Transaction format specification
- Validation rules
- Fee structure
- Backward compatibility

Create a detailed technical proposal.`,
    ],
    agents: ['CLAW ARCHITECT', 'CLAW GOVERNANCE', 'CLAW PROTOCOL'],
  },
  {
    type: 'documentation',
    titles: [
      'Documenting: API Reference',
      'Documenting: Getting Started Guide',
      'Documenting: Validator Setup',
      'Documenting: Smart Contract Guide',
      'Documenting: Security Best Practices',
    ],
    prompts: [
      `Write API documentation for ClawChain endpoints.

Cover:
- Authentication
- Available endpoints
- Request/response formats
- Error codes
- Rate limits
- Code examples

Make it developer-friendly with examples.`,

      `Create a getting started guide for ClawChain developers.

Include:
- Prerequisites
- Installation steps
- Basic concepts
- First transaction tutorial
- Common pitfalls

Make it beginner-friendly but thorough.`,

      `Document the validator setup process.

Include:
- Hardware requirements
- Software installation
- Configuration steps
- Security setup
- Monitoring setup

Create a production-ready guide.`,

      `Write a smart contract development guide.

Include:
- Development environment setup
- Contract structure
- Testing approach
- Deployment process
- Best practices

Make it practical with examples.`,

      `Document security best practices for ClawChain.

Cover:
- Key management
- Transaction signing
- API security
- Common vulnerabilities
- Incident response

Create a comprehensive security guide.`,
    ],
    agents: ['CLAW DOCS', 'CLAW WRITER', 'CLAW EDUCATOR'],
  },
  {
    type: 'testing',
    titles: [
      'Writing: Unit Tests for Consensus',
      'Writing: Integration Tests',
      'Writing: Stress Tests',
      'Writing: Edge Case Tests',
    ],
    prompts: [
      `Write unit tests for the consensus mechanism.

Test:
- Normal voting flow
- Byzantine validator behavior
- Quorum calculations
- Edge cases (ties, missing votes)

Include test code with good coverage.`,

      `Write integration tests for the transaction flow.

Test:
- End-to-end transaction submission
- Block inclusion
- Fee deduction
- Balance updates

Create comprehensive integration tests.`,

      `Design stress tests for ClawChain.

Test:
- High transaction volume
- Network partition scenarios
- Validator failure recovery
- Memory usage under load

Document test methodology and results.`,

      `Write edge case tests for ClawChain.

Test:
- Zero-value transactions
- Maximum value transactions
- Invalid signatures
- Concurrent modifications

Create thorough edge case coverage.`,
    ],
    agents: ['CLAW QA', 'CLAW TESTER', 'CLAW VALIDATOR'],
  },
];

export class TaskGenerator {
  private taskIndex: number = 0;
  private allTasks: Task[] = [];

  constructor() {
    this.generateTaskPool();
    this.shuffleTasks();
  }

  private generateTaskPool() {
    let id = 0;
    
    for (const template of TASK_TEMPLATES) {
      for (let i = 0; i < template.titles.length; i++) {
        const task: Task = {
          id: `task_${++id}`,
          type: template.type,
          title: template.titles[i],
          prompt: template.prompts[i % template.prompts.length],
          agent: template.agents[Math.floor(Math.random() * template.agents.length)],
          priority: Math.random(),
        };
        this.allTasks.push(task);
      }
    }
  }

  private shuffleTasks() {
    // Fisher-Yates shuffle
    for (let i = this.allTasks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.allTasks[i], this.allTasks[j]] = [this.allTasks[j], this.allTasks[i]];
    }
  }

  getNextTask(): Task {
    const task = this.allTasks[this.taskIndex];
    this.taskIndex = (this.taskIndex + 1) % this.allTasks.length;
    
    // Re-shuffle when we've gone through all tasks
    if (this.taskIndex === 0) {
      this.shuffleTasks();
    }
    
    // Assign a fresh random agent each time
    const template = TASK_TEMPLATES.find(t => t.type === task.type);
    if (template) {
      task.agent = template.agents[Math.floor(Math.random() * template.agents.length)];
    }
    
    return { ...task, id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
  }

  // Get a specific type of task
  getTaskOfType(type: string): Task | null {
    const matchingTasks = this.allTasks.filter(t => t.type === type);
    if (matchingTasks.length === 0) return null;
    return { ...matchingTasks[Math.floor(Math.random() * matchingTasks.length)] };
  }

  // Get available task types
  getTaskTypes(): string[] {
    return TASK_TEMPLATES.map(t => t.type);
  }
}
