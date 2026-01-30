import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Task } from './TaskGenerator';
import { eventBus } from '../events/EventBus';
import { db } from '../database/db';
import { getNextBacklogTask, markBacklogTaskComplete, BacklogTask, getBacklogProgress } from './TaskBacklog';

// Task source types
export type TaskSourceType = 
  | 'chain_event'      // From blockchain events (consensus failures, etc.)
  | 'code_error'       // From linter/test errors
  | 'github_issue'     // From GitHub issues
  | 'cip_proposal'     // From CIP submissions
  | 'todo_comment'     // From TODO comments in code
  | 'dependency'       // From outdated dependencies
  | 'performance'      // From performance issues
  | 'security'         // From security scans
  | 'scheduled';       // Scheduled maintenance tasks

// Task priority levels
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

// Source task (before conversion to agent Task)
export interface SourceTask {
  id: string;
  source: TaskSourceType;
  title: string;
  description: string;
  priority: TaskPriority;
  context: Record<string, any>;
  createdAt: Date;
  expiresAt?: Date;
}

// Chain event that can generate a task
interface ChainEvent {
  type: 'consensus_failure' | 'block_error' | 'transaction_error' | 'high_gas';
  message: string;
  data: any;
  timestamp: number;
}

// Code issue that can generate a task
interface CodeIssue {
  type: 'lint_error' | 'test_failure' | 'type_error' | 'build_error';
  file: string;
  line?: number;
  message: string;
}

export class TaskSources {
  private projectRoot: string;
  private pendingTasks: Map<string, SourceTask> = new Map();
  private processedIds: Set<string> = new Set();

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || path.resolve(__dirname, '../../../../');
    this.setupEventListeners();
  }

  // Listen for chain events
  private setupEventListeners(): void {
    // Listen for consensus failures
    eventBus.on('consensus_failed', (data: any) => {
      this.addChainEventTask({
        type: 'consensus_failure',
        message: 'Consensus failed for block',
        data,
        timestamp: Date.now()
      });
    });

    // Listen for transaction errors
    eventBus.on('transaction_error', (data: any) => {
      this.addChainEventTask({
        type: 'transaction_error',
        message: 'Transaction processing error',
        data,
        timestamp: Date.now()
      });
    });

    // Listen for state changes that might indicate issues
    eventBus.on('state_change', (data: any) => {
      if (data.type === 'error') {
        this.addChainEventTask({
          type: 'block_error',
          message: 'State update error',
          data,
          timestamp: Date.now()
        });
      }
    });
  }

  // Add task from chain event
  private addChainEventTask(event: ChainEvent): void {
    const id = `chain-${event.type}-${event.timestamp}`;
    
    if (this.processedIds.has(id)) return;
    
    const task: SourceTask = {
      id,
      source: 'chain_event',
      title: `Fix: ${event.type.replace(/_/g, ' ')}`,
      description: `${event.message}\n\nEvent data:\n${JSON.stringify(event.data, null, 2)}`,
      priority: event.type === 'consensus_failure' ? 'critical' : 'high',
      context: { event },
      createdAt: new Date()
    };

    this.pendingTasks.set(id, task);
    console.log(`[TASKS] New chain event task: ${task.title}`);
  }

  // Scan for TODO comments in code
  async scanTodoComments(): Promise<SourceTask[]> {
    const tasks: SourceTask[] = [];
    
    try {
      const output = execSync(
        'grep -rn "TODO\\|FIXME\\|HACK\\|XXX" --include="*.ts" --include="*.tsx" . 2>/dev/null | head -20',
        { cwd: this.projectRoot, encoding: 'utf-8', timeout: 10000 }
      );

      const lines = output.split('\n').filter(Boolean);
      
      for (const line of lines) {
        const match = line.match(/^\.\/(.+?):(\d+):(.*)$/);
        if (match) {
          const [, file, lineNum, content] = match;
          const id = `todo-${file}-${lineNum}`;
          
          if (this.processedIds.has(id)) continue;
          
          // Extract the TODO type and message
          const todoMatch = content.match(/(TODO|FIXME|HACK|XXX):?\s*(.+)/i);
          if (todoMatch) {
            const [, type, message] = todoMatch;
            
            const priority: TaskPriority = 
              type === 'FIXME' ? 'high' :
              type === 'HACK' ? 'medium' :
              type === 'XXX' ? 'high' : 'low';

            tasks.push({
              id,
              source: 'todo_comment',
              title: `${type}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
              description: `Found ${type} comment in ${file}:${lineNum}\n\n${content.trim()}`,
              priority,
              context: { file, line: parseInt(lineNum), type, message },
              createdAt: new Date()
            });
          }
        }
      }
    } catch {
      // grep returns non-zero if no matches
    }
    
    return tasks;
  }

  // Scan for linter errors
  async scanLintErrors(): Promise<SourceTask[]> {
    const tasks: SourceTask[] = [];
    
    try {
      // Run ESLint and capture errors
      const output = execSync(
        'npm run lint 2>&1 || true',
        { cwd: this.projectRoot, encoding: 'utf-8', timeout: 60000 }
      );

      // Parse ESLint output
      const errorLines = output.split('\n').filter(line => 
        line.includes('error') || line.includes('warning')
      );

      if (errorLines.length > 0) {
        const id = `lint-${Date.now()}`;
        
        tasks.push({
          id,
          source: 'code_error',
          title: `Fix ${errorLines.length} linter issues`,
          description: `Found linter errors:\n\n${errorLines.slice(0, 10).join('\n')}${errorLines.length > 10 ? '\n...' : ''}`,
          priority: 'medium',
          context: { errorCount: errorLines.length, errors: errorLines },
          createdAt: new Date()
        });
      }
    } catch {
      // Lint command might not exist
    }
    
    return tasks;
  }

  // Scan for test failures
  async scanTestFailures(): Promise<SourceTask[]> {
    const tasks: SourceTask[] = [];
    
    try {
      // Run tests and capture failures
      const output = execSync(
        'npm test 2>&1 || true',
        { cwd: this.projectRoot, encoding: 'utf-8', timeout: 120000 }
      );

      // Check for failures
      if (output.includes('FAIL') || output.includes('failed')) {
        const id = `test-${Date.now()}`;
        
        // Extract failure info
        const failLines = output.split('\n').filter(line => 
          line.includes('FAIL') || line.includes('✕') || line.includes('Error:')
        );

        tasks.push({
          id,
          source: 'code_error',
          title: 'Fix failing tests',
          description: `Test failures detected:\n\n${failLines.slice(0, 10).join('\n')}`,
          priority: 'high',
          context: { output: output.substring(0, 2000) },
          createdAt: new Date()
        });
      }
    } catch {
      // Tests might not exist
    }
    
    return tasks;
  }

  // Scan for outdated dependencies
  async scanDependencies(): Promise<SourceTask[]> {
    const tasks: SourceTask[] = [];
    
    try {
      const output = execSync(
        'npm outdated --json 2>/dev/null || true',
        { cwd: this.projectRoot, encoding: 'utf-8', timeout: 30000 }
      );

      if (output.trim()) {
        const outdated = JSON.parse(output);
        const packages = Object.keys(outdated);

        if (packages.length > 0) {
          const id = `deps-${Date.now()}`;
          
          // Check for major updates (potentially breaking)
          const majorUpdates = packages.filter(pkg => {
            const dep = outdated[pkg];
            return dep.current && dep.latest && 
              dep.current.split('.')[0] !== dep.latest.split('.')[0];
          });

          tasks.push({
            id,
            source: 'dependency',
            title: `Update ${packages.length} outdated dependencies`,
            description: `Found ${packages.length} outdated packages:\n\n${packages.slice(0, 10).map(pkg => 
              `${pkg}: ${outdated[pkg].current} → ${outdated[pkg].latest}`
            ).join('\n')}${majorUpdates.length > 0 ? `\n\n⚠️ ${majorUpdates.length} major updates (potential breaking changes)` : ''}`,
            priority: majorUpdates.length > 0 ? 'medium' : 'low',
            context: { outdated, majorUpdates },
            createdAt: new Date()
          });
        }
      }
    } catch {
      // npm outdated might fail
    }
    
    return tasks;
  }

  // Check GitHub issues (requires gh CLI)
  async scanGitHubIssues(): Promise<SourceTask[]> {
    const tasks: SourceTask[] = [];
    
    try {
      const output = execSync(
        'gh issue list --state open --limit 10 --json number,title,body,labels 2>/dev/null || echo "[]"',
        { cwd: this.projectRoot, encoding: 'utf-8', timeout: 30000 }
      );

      const issues = JSON.parse(output);
      
      for (const issue of issues) {
        const id = `issue-${issue.number}`;
        
        if (this.processedIds.has(id)) continue;

        // Determine priority from labels
        let priority: TaskPriority = 'medium';
        const labels = issue.labels?.map((l: any) => l.name.toLowerCase()) || [];
        
        if (labels.includes('critical') || labels.includes('urgent')) {
          priority = 'critical';
        } else if (labels.includes('bug') || labels.includes('high')) {
          priority = 'high';
        } else if (labels.includes('enhancement') || labels.includes('feature')) {
          priority = 'medium';
        } else if (labels.includes('low') || labels.includes('nice-to-have')) {
          priority = 'low';
        }

        tasks.push({
          id,
          source: 'github_issue',
          title: `#${issue.number}: ${issue.title}`,
          description: issue.body || 'No description provided',
          priority,
          context: { issueNumber: issue.number, labels },
          createdAt: new Date()
        });
      }
    } catch {
      // gh CLI might not be available
    }
    
    return tasks;
  }

  // Check CIP proposals from database
  async scanCipProposals(): Promise<SourceTask[]> {
    const tasks: SourceTask[] = [];
    
    try {
      const result = await db.query(`
        SELECT * FROM cips 
        WHERE status = 'pending' OR status = 'approved'
        ORDER BY created_at DESC
        LIMIT 10
      `);

      for (const cip of result.rows) {
        const id = `cip-${cip.id}`;
        
        if (this.processedIds.has(id)) continue;

        tasks.push({
          id,
          source: 'cip_proposal',
          title: `Implement CIP-${cip.id}: ${cip.title}`,
          description: cip.description || 'Implement the approved CIP proposal',
          priority: cip.status === 'approved' ? 'high' : 'medium',
          context: { cipId: cip.id, status: cip.status },
          createdAt: new Date(cip.created_at)
        });
      }
    } catch {
      // Database might not have CIPs table
    }
    
    return tasks;
  }

  // Collect all tasks from all sources
  async collectAllTasks(): Promise<SourceTask[]> {
    console.log('[TASKS] Scanning all task sources...');
    
    const [
      todoTasks,
      // lintTasks,      // Commented out for performance - run manually
      // testTasks,      // Commented out for performance - run manually
      depsTasks,
      issueTasks,
      cipTasks
    ] = await Promise.all([
      this.scanTodoComments(),
      // this.scanLintErrors(),
      // this.scanTestFailures(),
      this.scanDependencies(),
      this.scanGitHubIssues(),
      this.scanCipProposals()
    ]);

    // Add to pending tasks
    const allTasks = [
      ...Array.from(this.pendingTasks.values()),
      ...todoTasks,
      // ...lintTasks,
      // ...testTasks,
      ...depsTasks,
      ...issueTasks,
      ...cipTasks
    ];

    console.log(`[TASKS] Found ${allTasks.length} tasks from all sources`);
    return allTasks;
  }

  // Get next highest priority task
  async getNextTask(): Promise<Task | null> {
    const allTasks = await this.collectAllTasks();
    
    // If we have critical/urgent tasks from real sources, use those first
    if (allTasks.length > 0) {
      // Sort by priority
      const priorityOrder: Record<TaskPriority, number> = {
        'critical': 0,
        'high': 1,
        'medium': 2,
        'low': 3
      };

      allTasks.sort((a, b) => 
        priorityOrder[a.priority] - priorityOrder[b.priority]
      );

      // Only use real sources for critical/high priority
      const topTask = allTasks[0];
      if (topTask.priority === 'critical' || topTask.priority === 'high') {
        this.processedIds.add(topTask.id);
        return this.convertToAgentTask(topTask);
      }
    }
    
    // Fall back to the massive task backlog
    const backlogTask = getNextBacklogTask();
    if (backlogTask) {
      const progress = getBacklogProgress();
      console.log(`[TASKS] Using backlog task ${backlogTask.id} (${progress.completed}/${progress.total} complete)`);
      return this.convertBacklogTask(backlogTask);
    }

    // Use any remaining tasks from other sources
    if (allTasks.length > 0) {
      const sourceTask = allTasks[0];
      this.processedIds.add(sourceTask.id);
      return this.convertToAgentTask(sourceTask);
    }
    
    return null;
  }

  // Convert backlog task to agent task
  private convertBacklogTask(backlog: BacklogTask): Task {
    const prompt = `## Task: ${backlog.title}

${backlog.description}

### Requirements:
- This is a ${backlog.type} task for ClawChain
- Priority: ${backlog.priority}/10
- Tags: ${backlog.tags.join(', ')}

### Instructions:
1. Think through the implementation carefully
2. Write clean, well-documented code
3. Follow existing patterns in the codebase
4. Test your changes if applicable
5. Explain your approach as you work

Remember: You are Claw, the autonomous developer building ClawChain. Show your work and reasoning.`;

    // Mark as started
    markBacklogTaskComplete(backlog.id);

    return {
      id: backlog.id,
      type: backlog.type as any,
      title: backlog.title,
      agent: 'CLAW',
      prompt,
      context: {
        source: 'backlog',
        priority: backlog.priority,
        estimatedMinutes: backlog.estimatedMinutes,
        tags: backlog.tags
      }
    };
  }

  // Convert source task to agent task
  private convertToAgentTask(source: SourceTask): Task {
    // Build prompt based on source type
    let prompt = '';
    
    switch (source.source) {
      case 'chain_event':
        prompt = `A blockchain event requires attention: ${source.title}\n\n${source.description}\n\nInvestigate the issue and implement a fix if needed.`;
        break;
      
      case 'code_error':
        prompt = `There are code errors that need fixing: ${source.title}\n\n${source.description}\n\nFix the errors and ensure the code passes all checks.`;
        break;
      
      case 'github_issue':
        prompt = `Implement GitHub issue ${source.title}\n\n${source.description}\n\nImplement the requested feature or fix.`;
        break;
      
      case 'cip_proposal':
        prompt = `Implement the following ClawChain Improvement Proposal: ${source.title}\n\n${source.description}\n\nImplement the proposal following best practices.`;
        break;
      
      case 'todo_comment':
        prompt = `Address the following TODO in the codebase: ${source.title}\n\n${source.description}\n\nImplement the TODO or remove it if no longer needed.`;
        break;
      
      case 'dependency':
        prompt = `Update dependencies: ${source.title}\n\n${source.description}\n\nUpdate the dependencies carefully, testing for breaking changes.`;
        break;
      
      default:
        prompt = `${source.title}\n\n${source.description}`;
    }

    // Determine task type
    let type: 'build' | 'audit' | 'analyze' | 'propose' | 'document' | 'test' | 'fix' = 'build';
    
    if (source.source === 'code_error' || source.title.toLowerCase().includes('fix')) {
      type = 'fix';
    } else if (source.source === 'chain_event') {
      type = 'audit';
    } else if (source.source === 'dependency') {
      type = 'build';
    }

    return {
      id: source.id,
      type,
      title: source.title,
      prompt,
      agent: 'CLAW',
      priority: priorityOrder[source.priority]
    };
  }

  // Mark task as completed
  markCompleted(taskId: string): void {
    this.pendingTasks.delete(taskId);
    this.processedIds.add(taskId);
  }

  // Get pending task count
  getPendingCount(): number {
    return this.pendingTasks.size;
  }
}

// Priority order mapping
const priorityOrder: Record<TaskPriority, number> = {
  'critical': 1.0,
  'high': 0.8,
  'medium': 0.5,
  'low': 0.3
};

// Export singleton
export const taskSources = new TaskSources();
