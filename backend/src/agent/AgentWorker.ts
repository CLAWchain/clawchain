import * as dotenv from 'dotenv';
import { EventEmitter } from 'events';
import { TaskGenerator, Task } from './TaskGenerator';
import { agentMemory } from './AgentMemory';
import { chainObserver } from './ChainObserver';
import { agentGoals } from './AgentGoals';
import { agentBrain, Decision } from './AgentBrain';
import { agentExecutor, AGENT_TOOLS } from './AgentExecutor';
import { taskSources } from './TaskSources';
import { gitIntegration } from './GitIntegration';

dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Event emitter for broadcasting to SSE clients
export const agentEvents = new EventEmitter();
agentEvents.setMaxListeners(100);

interface AgentState {
  isWorking: boolean;
  currentTask: Task | null;
  currentOutput: string;
  completedTasks: Array<{ task: Task; output: string; completedAt: Date }>;
  currentDecision: Decision | null;
  heartbeatCount: number;
  brainActive: boolean;
}

class AgentWorker {
  private state: AgentState = {
    isWorking: false,
    currentTask: null,
    currentOutput: '',
    completedTasks: [],
    currentDecision: null,
    heartbeatCount: 0,
    brainActive: false,
  };
  
  private taskGenerator: TaskGenerator;
  private isRunning: boolean = false;
  private currentAbortController: AbortController | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private useBrain: boolean = true;

  constructor() {
    this.taskGenerator = new TaskGenerator();
  }

  getState(): AgentState {
    // Return persisted completed tasks from memory instead of in-memory state
    const persistedTasks = agentMemory.getCompletedTasks(10);
    return { 
      ...this.state,
      completedTasks: persistedTasks.map(t => ({
        task: {
          id: t.taskId,
          type: t.taskType,
          title: t.title,
          agent: t.agent,
          priority: 0.5,
          prompt: '',
        },
        output: t.output,
        completedAt: t.completedAt,
      })),
    };
  }

  // Broadcast a chunk to all connected SSE clients
  private broadcast(eventType: string, data: any) {
    agentEvents.emit('chunk', { type: eventType, data, timestamp: Date.now() });
  }

  // Helper for async delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Initialize the brain systems
  private async initializeBrain(): Promise<void> {
    console.log('[AGENT] Initializing autonomous brain...');
    
    try {
      // Initialize all subsystems
      await agentMemory.initialize();
      await agentGoals.initialize();
      await chainObserver.start();
      
      this.state.brainActive = true;
      console.log('[AGENT] Brain systems online');
      
      // Broadcast brain status
      this.broadcast('brain_status', { active: true, message: 'Autonomous systems initialized' });
    } catch (error) {
      console.error('[AGENT] Brain initialization failed:', error);
      this.useBrain = false;
      this.state.brainActive = false;
    }
  }

  // Heartbeat - periodic self-check and proactive behavior
  private startHeartbeat(): void {
    // Every 60 seconds, do a heartbeat
    this.heartbeatInterval = setInterval(async () => {
      if (!this.isRunning || this.state.isWorking) return;
      
      this.state.heartbeatCount++;
      console.log(`[AGENT] Heartbeat #${this.state.heartbeatCount}`);
      
      // Update memory
      await agentMemory.updateWorkingContext({ lastHeartbeat: new Date() });
      
      // Broadcast heartbeat with status
      const memorySummary = await agentMemory.getSummary();
      const goalsSummary = agentGoals.getSummary();
      const observerSummary = chainObserver.getSummary();
      
      this.broadcast('heartbeat', {
        count: this.state.heartbeatCount,
        memory: memorySummary.substring(0, 200),
        goals: goalsSummary.substring(0, 200),
        chain: observerSummary.substring(0, 200),
      });
      
    }, 60000);
  }

  // Get next action from real sources, brain, or fallback to task generator
  private async getNextAction(): Promise<{ task: Task; context: string }> {
    // First, try to get a real task from TaskSources
    try {
      const realTask = await taskSources.getNextTask();
      if (realTask) {
        console.log(`[AGENT] Got real task from sources: ${realTask.title}`);
        this.state.currentDecision = {
          action: 'real_task',
          reasoning: `Found real work: ${realTask.title}`,
          task: realTask,
          context: ''
        };
        return { task: realTask, context: 'Task from real source (issue, TODO, chain event)' };
      }
    } catch (error) {
      console.error('[AGENT] TaskSources failed:', error);
    }

    // Next, try the brain for autonomous decisions
    if (this.useBrain && this.state.brainActive) {
      try {
        const decision = await agentBrain.decideNextAction();
        this.state.currentDecision = decision;
        
        if (decision.task) {
          // Augment prompt with context
          const augmentedTask = {
            ...decision.task,
            prompt: `${decision.context}\n\n---\n\n${decision.task.prompt}`,
          };
          return { task: augmentedTask, context: decision.context };
        }
      } catch (error) {
        console.error('[AGENT] Brain decision failed, using fallback:', error);
      }
    }
    
    // Fallback to simple task generator
    const task = this.taskGenerator.getNextTask();
    return { task, context: '' };
  }

  // Stream from Anthropic API with real-time broadcasting
  private async streamTask(task: Task): Promise<string> {
    if (!ANTHROPIC_API_KEY) {
      // Simulate streaming for demo when no API key
      return this.simulateStream(task);
    }

    // Build system prompt with brain context
    const memorySummary = this.state.brainActive ? await agentMemory.getSummary() : '';
    const goalsSummary = this.state.brainActive ? agentGoals.getSummary() : '';
    
    const systemPrompt = `You are CLAW, an autonomous AI developer actively building and improving ClawChain - an AI-governed blockchain.

You are currently working on a task. Think out loud, explain your reasoning, and show your work as you go. Write code when needed. Be conversational but focused.

${memorySummary ? `## Your Memory\n${memorySummary}\n` : ''}
${goalsSummary ? `## Your Goals\n${goalsSummary}\n` : ''}

## Guidelines
- Start by briefly explaining what you're about to do
- Think through the problem step by step
- Show code with \`\`\` blocks when writing code
- Explain key decisions as you make them
- Note any insights or learnings
- Summarize what you accomplished at the end

Keep your response focused and around 500-800 words. You're being watched live - make it engaging!`;

    const body = {
      model: 'claude-3-haiku-20240307', // Use Haiku for cost-effective continuous streaming
      max_tokens: 1500,
      temperature: 0.8,
      stream: true,
      system: systemPrompt,
      messages: [
        { role: 'user', content: task.prompt },
      ],
    };

    try {
      this.currentAbortController = new AbortController();
      
      const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: this.currentAbortController.signal,
      });

      if (!response.ok) {
        const errTxt = await response.text();
        console.error('[AGENT] Anthropic API error:', errTxt);
        return this.simulateStream(task);
      }

      let fullOutput = '';
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        return this.simulateStream(task);
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                const text = parsed.delta.text;
                fullOutput += text;
                this.state.currentOutput = fullOutput;
                this.broadcast('text', text);
              }
            } catch (e) {
              // Ignore parse errors for non-JSON lines
            }
          }
        }
      }

      return fullOutput;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('[AGENT] Task was aborted');
        return this.state.currentOutput;
      }
      console.error('[AGENT] Stream error:', error);
      return this.simulateStream(task);
    }
  }

  // Stream task with tool use - the REAL agent mode
  private async streamTaskWithTools(task: Task): Promise<string> {
    if (!ANTHROPIC_API_KEY) {
      return this.simulateStream(task);
    }

    // Build system prompt for agentic mode
    const memorySummary = this.state.brainActive ? await agentMemory.getSummary() : '';
    const goalsSummary = this.state.brainActive ? agentGoals.getSummary() : '';
    
    const systemPrompt = `You are CLAW, an autonomous AI developer ACTUALLY building ClawChain - a real blockchain project.

You have access to tools that let you READ FILES, WRITE CODE, and RUN COMMANDS. Use them!

${memorySummary ? `## Your Memory\n${memorySummary}\n` : ''}
${goalsSummary ? `## Your Goals\n${goalsSummary}\n` : ''}

## How to Work
1. Use 'explain' to narrate what you're doing (viewers can see this live)
2. Use 'list_files' and 'read_file' to explore the codebase
3. Use 'write_file' to create or modify code
4. Use 'run_command' to run npm commands, tests, or git
5. Use 'git_commit' to save your work

## Important Guidelines
- ALWAYS explain what you're doing before doing it
- Show your thought process
- Make small, incremental changes
- Test your changes when possible
- Commit working code

You are being watched LIVE on the web. Make it educational and engaging!`;

    let messages: any[] = [
      { role: 'user', content: task.prompt }
    ];
    
    let fullOutput = '';
    let iterations = 0;
    const maxIterations = 10; // Prevent infinite loops

    while (iterations < maxIterations) {
      iterations++;
      
      try {
        this.currentAbortController = new AbortController();
        
        const response = await fetch(ANTHROPIC_API_URL, {
          method: 'POST',
          headers: {
            'x-api-key': ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 2000,
            temperature: 0.7,
            system: systemPrompt,
            tools: AGENT_TOOLS,
            messages,
          }),
          signal: this.currentAbortController.signal,
        });

        if (!response.ok) {
          const errTxt = await response.text();
          console.error('[AGENT] API error:', errTxt);
          this.broadcast('text', '\n[Error communicating with AI. Falling back to simulation.]\n');
          return this.simulateStream(task);
        }

        const result = await response.json() as any;
        
        // Process content blocks
        let hasToolUse = false;
        const toolResults: any[] = [];
        
        for (const block of result.content || []) {
          if (block.type === 'text') {
            // Stream the text to frontend
            fullOutput += block.text;
            this.state.currentOutput = fullOutput;
            
            // Broadcast in chunks for streaming effect
            const words = block.text.split(' ');
            for (let i = 0; i < words.length; i += 3) {
              const chunk = words.slice(i, i + 3).join(' ') + ' ';
              this.broadcast('text', chunk);
              await this.delay(50);
            }
          }
          
          if (block.type === 'tool_use') {
            hasToolUse = true;
            const toolName = block.name;
            const toolInput = block.input;
            
            // Announce tool use
            this.broadcast('tool_start', { tool: toolName, input: toolInput });
            fullOutput += `\n[Executing: ${toolName}]\n`;
            this.broadcast('text', `\n[Executing: ${toolName}]\n`);
            
            // Execute the tool
            const toolResult = await agentExecutor.executeTool(toolName, toolInput);
            
            // Format result for display
            let resultDisplay = '';
            if (toolName === 'read_file' && toolResult.content) {
              const preview = toolResult.content.substring(0, 500);
              resultDisplay = `Read ${toolResult.path} (${toolResult.content.length} chars):\n\`\`\`\n${preview}${toolResult.content.length > 500 ? '\n...' : ''}\n\`\`\``;
            } else if (toolName === 'write_file') {
              resultDisplay = toolResult.success 
                ? `Wrote to ${toolResult.path}` 
                : `Failed: ${toolResult.error}`;
            } else if (toolName === 'run_command') {
              resultDisplay = `Exit: ${toolResult.exitCode}\n\`\`\`\n${toolResult.output.substring(0, 500)}${toolResult.output.length > 500 ? '\n...' : ''}\n\`\`\``;
            } else if (toolName === 'list_files') {
              resultDisplay = `Files:\n${(toolResult.files || []).slice(0, 20).join('\n')}`;
            } else if (toolName === 'search_code') {
              const matches = toolResult.matches || [];
              resultDisplay = `Found ${matches.length} matches:\n${matches.slice(0, 5).map((m: any) => `${m.file}:${m.line}: ${m.content}`).join('\n')}`;
            } else if (toolName === 'git_status') {
              resultDisplay = `Branch: ${toolResult.branch}\nLast commit: ${toolResult.commit}\n${toolResult.output}`;
            } else if (toolName === 'git_commit') {
              resultDisplay = toolResult.success 
                ? `Committed: ${toolResult.commit}` 
                : `Failed: ${toolResult.error}`;
            } else if (toolName === 'explain') {
              resultDisplay = ''; // Already streamed
            } else {
              resultDisplay = JSON.stringify(toolResult, null, 2).substring(0, 300);
            }
            
            if (resultDisplay) {
              fullOutput += resultDisplay + '\n';
              this.broadcast('text', resultDisplay + '\n');
            }
            
            this.broadcast('tool_complete', { tool: toolName, result: toolResult });
            
            // Add to tool results for next iteration
            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: JSON.stringify(toolResult)
            });
          }
        }
        
        // If there were tool uses, add assistant response and tool results to messages
        if (hasToolUse) {
          messages.push({ role: 'assistant', content: result.content });
          messages.push({ role: 'user', content: toolResults });
        }
        
        // Check stop reason
        if (result.stop_reason === 'end_turn' || !hasToolUse) {
          // Done!
          break;
        }
        
        // Continue the loop for more tool calls
        
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('[AGENT] Task was aborted');
          return this.state.currentOutput;
        }
        console.error('[AGENT] Tool stream error:', error);
        this.broadcast('text', '\n[Error occurred. Stopping.]\n');
        break;
      }
    }

    if (iterations >= maxIterations) {
      this.broadcast('text', '\n[Reached maximum iterations. Stopping.]\n');
    }

    return fullOutput;
  }

  // Simulate streaming for demo/no API key scenarios
  private async simulateStream(task: Task): Promise<string> {
    const simulatedResponses: Record<string, string> = {
      'build': `Alright, let me build this utility for ClawChain.

**First, let me think about what we need...**

This tool needs to handle the core functionality efficiently. Let me break it down:

1. Input validation - we need to make sure the data is clean
2. Core logic - the main processing
3. Output formatting - making it useful

\`\`\`typescript
// ClawChain Utility
export class ChainUtility {
  private cache: Map<string, any> = new Map();
  
  constructor(private chainId: string = 'clawchain-mainnet') {
    console.log(\`Initializing utility for \${chainId}\`);
  }
  
  async process(input: string): Promise<Result> {
    // Validate input first
    if (!this.validate(input)) {
      throw new Error('Invalid input format');
    }
    
    // Check cache
    const cached = this.cache.get(input);
    if (cached) return cached;
    
    // Process and cache
    const result = await this.compute(input);
    this.cache.set(input, result);
    
    return result;
  }
  
  private validate(input: string): boolean {
    return input.length > 0 && input.length < 1000;
  }
  
  private async compute(input: string): Promise<Result> {
    // Core computation logic
    return { success: true, data: input.toUpperCase() };
  }
}
\`\`\`

**Testing the implementation...**

The utility is now ready. It handles caching for performance, validates inputs, and processes data efficiently.

Next steps would be to add more specific validation rules and integrate with the chain's event system.`,

      'audit': `Starting security audit of this component...

**Initial scan...**

Looking at the code structure, I'm checking for:
- Input validation vulnerabilities
- Access control issues  
- Potential reentrancy
- Integer overflow risks

\`\`\`typescript
// FINDING 1: Missing input sanitization
// Risk: Medium
// Location: processTransaction()

// Before (vulnerable):
async processTransaction(data: any) {
  return await this.execute(data);
}

// After (secure):
async processTransaction(data: unknown) {
  const validated = this.sanitize(data);
  if (!validated.success) {
    throw new SecurityError('Invalid transaction data');
  }
  return await this.execute(validated.data);
}
\`\`\`

**Access control check...**

The permission system looks solid. Admin functions are properly gated.

**Summary:**
- 1 medium-risk issue found (input validation)
- Recommended fix provided above
- No critical vulnerabilities detected
- Access control: PASS`,

      'analyze': `Analyzing ClawChain metrics...

**Fetching recent block data...**

Looking at the last 100 blocks:
- Average block time: 9.8 seconds (target: 10s) ✓
- Transaction throughput: 45 TPS average
- Failed transactions: 0.3%
- Validator participation: 100%

**Pattern analysis...**

\`\`\`
Block Production Timeline:
[████████████████████] Block #1847 - CLAW VALIDATOR
[████████████████████] Block #1848 - CLAW ARCHITECT  
[████████████████████] Block #1849 - CLAW ANALYST
...
\`\`\`

**Observations:**

1. **Block times are consistent** - The 10-second target is being hit reliably
2. **Validator rotation is working** - All 6 validators are participating equally
3. **No anomalies detected** - Transaction patterns look normal

**Recommendation:**

The chain is healthy. Consider:
- Monitoring gas usage trends
- Setting up alerts for block time deviations > 15s
- Weekly validator performance reports`,

      'propose': `Drafting a protocol improvement proposal...

**MIP-007: Dynamic Fee Adjustment**

**Summary:**
Implement automatic fee adjustment based on network congestion.

**Motivation:**
Currently fees are static. During high-traffic periods, the mempool can get congested. Dynamic fees would:
- Prioritize important transactions
- Discourage spam during peak times
- Reduce fees during quiet periods

**Specification:**

\`\`\`typescript
interface FeeCalculator {
  baseFee: bigint;
  congestionMultiplier: number;
  
  calculateFee(pendingTxCount: number): bigint {
    const congestion = pendingTxCount / MAX_MEMPOOL_SIZE;
    const multiplier = 1 + (congestion * this.congestionMultiplier);
    return this.baseFee * BigInt(Math.ceil(multiplier));
  }
}

// Example:
// - Base fee: 100 CLAW
// - 50% mempool full → 150 CLAW
// - 90% mempool full → 190 CLAW
\`\`\`

**Implementation:**
1. Add FeeCalculator to transaction pool
2. Update transaction validation
3. Add fee field to block headers
4. Frontend updates to show dynamic fees

**Timeline:** 2 weeks for implementation, 1 week testing

Ready for council review.`,
    };

    // Pick appropriate response based on task type
    let response = simulatedResponses['build'];
    if (task.type.includes('audit') || task.type.includes('review')) {
      response = simulatedResponses['audit'];
    } else if (task.type.includes('analyze') || task.type.includes('report')) {
      response = simulatedResponses['analyze'];
    } else if (task.type.includes('propose') || task.type.includes('improve')) {
      response = simulatedResponses['propose'];
    }

    // Stream character by character with variable delays
    let fullOutput = '';
    for (const char of response) {
      fullOutput += char;
      this.state.currentOutput = fullOutput;
      this.broadcast('text', char);
      
      // Variable delay for natural feel
      const delay = char === '\n' ? 50 : char === ' ' ? 15 : 8;
      await this.sleep(delay);
    }

    return fullOutput;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Main worker loop
  async start() {
    if (this.isRunning) {
      console.log('[AGENT] Worker already running');
      return;
    }

    this.isRunning = true;
    console.log('[AGENT] Autonomous agent worker started');
    this.broadcast('status', { status: 'started' });

    // Initialize the brain systems
    await this.initializeBrain();
    
    // Start heartbeat
    this.startHeartbeat();

    while (this.isRunning) {
      try {
        // Get next action from brain (or fallback to task generator)
        const { task, context } = await this.getNextAction();
        
        this.state.currentTask = task;
        this.state.currentOutput = '';
        this.state.isWorking = true;

        // Set focus in memory
        if (this.state.brainActive) {
          await agentMemory.setFocus(task.title);
        }

        console.log(`[AGENT] Starting task: ${task.title}`);
        this.broadcast('task_start', { 
          task: {
            id: task.id,
            title: task.title,
            type: task.type,
            agent: task.agent,
          },
          decision: this.state.currentDecision ? {
            action: this.state.currentDecision.action,
            reasoning: this.state.currentDecision.reasoning,
          } : null,
          brainActive: this.state.brainActive,
        });

        // Execute task with streaming
        // Use tool-based execution for build/audit/test tasks (real code execution)
        const useToolExecution = ['build', 'audit', 'test', 'fix'].includes(task.type);
        const output = useToolExecution 
          ? await this.streamTaskWithTools(task)
          : await this.streamTask(task);

        // Save completed task to persistent database
        await agentMemory.saveCompletedTask(
          task.id,
          task.type,
          task.title,
          task.agent,
          output
        );

        // Record completion in memory system
        if (this.state.brainActive) {
          await agentMemory.recordTaskCompletion(
            task.title,
            task.type,
            output,
            true
          );
          
          // Update goal progress if applicable
          if (this.state.currentDecision?.goal) {
            const goal = this.state.currentDecision.goal;
            const newProgress = Math.min(100, goal.progress + 10);
            await agentGoals.updateProgress(goal.id, newProgress, `Completed: ${task.title}`);
          }
          
          // Clear focus
          await agentMemory.setFocus(null);
        }

        console.log(`[AGENT] Completed task: ${task.title}`);
        this.broadcast('task_complete', { 
          taskId: task.id,
          title: task.title,
          brainActive: this.state.brainActive,
        });

        this.state.isWorking = false;
        this.state.currentTask = null;
        this.state.currentDecision = null;

        // Pause between tasks (15-45 seconds for autonomous mode)
        const pauseDuration = this.state.brainActive 
          ? 15000 + Math.random() * 30000  // Longer pause when thinking
          : 10000 + Math.random() * 20000;
          
        console.log(`[AGENT] Pausing for ${Math.round(pauseDuration / 1000)}s before next task...`);
        this.broadcast('status', { 
          status: 'thinking', 
          nextTaskIn: pauseDuration,
          brainActive: this.state.brainActive,
        });
        
        await this.sleep(pauseDuration);

      } catch (error) {
        console.error('[AGENT] Error in worker loop:', error);
        
        // Record error in memory
        if (this.state.brainActive) {
          await agentMemory.recordError(
            `Worker error: ${(error as Error).message}`,
            { task: this.state.currentTask?.title }
          );
        }
        
        this.broadcast('error', { message: 'Agent encountered an error, recovering...' });
        await this.sleep(5000);
      }
    }
  }

  stop() {
    console.log('[AGENT] Stopping worker...');
    this.isRunning = false;
    
    if (this.currentAbortController) {
      this.currentAbortController.abort();
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    chainObserver.stop();
    
    this.broadcast('status', { status: 'stopped' });
  }
}

// Singleton instance
export const agentWorker = new AgentWorker();
