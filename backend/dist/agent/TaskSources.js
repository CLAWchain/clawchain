"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskSources = exports.TaskSources = void 0;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const EventBus_1 = require("../events/EventBus");
const db_1 = require("../database/db");
const TaskBacklog_1 = require("./TaskBacklog");
class TaskSources {
    constructor(projectRoot) {
        this.pendingTasks = new Map();
        this.processedIds = new Set();
        this.projectRoot = projectRoot || path.resolve(__dirname, '../../../../');
        this.setupEventListeners();
    }
    // Listen for chain events
    setupEventListeners() {
        // Listen for consensus failures
        EventBus_1.eventBus.on('consensus_failed', (data) => {
            this.addChainEventTask({
                type: 'consensus_failure',
                message: 'Consensus failed for block',
                data,
                timestamp: Date.now()
            });
        });
        // Listen for transaction errors
        EventBus_1.eventBus.on('transaction_error', (data) => {
            this.addChainEventTask({
                type: 'transaction_error',
                message: 'Transaction processing error',
                data,
                timestamp: Date.now()
            });
        });
        // Listen for state changes that might indicate issues
        EventBus_1.eventBus.on('state_change', (data) => {
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
    addChainEventTask(event) {
        const id = `chain-${event.type}-${event.timestamp}`;
        if (this.processedIds.has(id))
            return;
        const task = {
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
    async scanTodoComments() {
        const tasks = [];
        try {
            const output = (0, child_process_1.execSync)('grep -rn "TODO\\|FIXME\\|HACK\\|XXX" --include="*.ts" --include="*.tsx" . 2>/dev/null | head -20', { cwd: this.projectRoot, encoding: 'utf-8', timeout: 10000 });
            const lines = output.split('\n').filter(Boolean);
            for (const line of lines) {
                const match = line.match(/^\.\/(.+?):(\d+):(.*)$/);
                if (match) {
                    const [, file, lineNum, content] = match;
                    const id = `todo-${file}-${lineNum}`;
                    if (this.processedIds.has(id))
                        continue;
                    // Extract the TODO type and message
                    const todoMatch = content.match(/(TODO|FIXME|HACK|XXX):?\s*(.+)/i);
                    if (todoMatch) {
                        const [, type, message] = todoMatch;
                        const priority = type === 'FIXME' ? 'high' :
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
        }
        catch {
            // grep returns non-zero if no matches
        }
        return tasks;
    }
    // Scan for linter errors
    async scanLintErrors() {
        const tasks = [];
        try {
            // Run ESLint and capture errors
            const output = (0, child_process_1.execSync)('npm run lint 2>&1 || true', { cwd: this.projectRoot, encoding: 'utf-8', timeout: 60000 });
            // Parse ESLint output
            const errorLines = output.split('\n').filter(line => line.includes('error') || line.includes('warning'));
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
        }
        catch {
            // Lint command might not exist
        }
        return tasks;
    }
    // Scan for test failures
    async scanTestFailures() {
        const tasks = [];
        try {
            // Run tests and capture failures
            const output = (0, child_process_1.execSync)('npm test 2>&1 || true', { cwd: this.projectRoot, encoding: 'utf-8', timeout: 120000 });
            // Check for failures
            if (output.includes('FAIL') || output.includes('failed')) {
                const id = `test-${Date.now()}`;
                // Extract failure info
                const failLines = output.split('\n').filter(line => line.includes('FAIL') || line.includes('✕') || line.includes('Error:'));
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
        }
        catch {
            // Tests might not exist
        }
        return tasks;
    }
    // Scan for outdated dependencies
    async scanDependencies() {
        const tasks = [];
        try {
            const output = (0, child_process_1.execSync)('npm outdated --json 2>/dev/null || true', { cwd: this.projectRoot, encoding: 'utf-8', timeout: 30000 });
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
                        description: `Found ${packages.length} outdated packages:\n\n${packages.slice(0, 10).map(pkg => `${pkg}: ${outdated[pkg].current} → ${outdated[pkg].latest}`).join('\n')}${majorUpdates.length > 0 ? `\n\n⚠️ ${majorUpdates.length} major updates (potential breaking changes)` : ''}`,
                        priority: majorUpdates.length > 0 ? 'medium' : 'low',
                        context: { outdated, majorUpdates },
                        createdAt: new Date()
                    });
                }
            }
        }
        catch {
            // npm outdated might fail
        }
        return tasks;
    }
    // Check GitHub issues (requires gh CLI)
    async scanGitHubIssues() {
        const tasks = [];
        try {
            const output = (0, child_process_1.execSync)('gh issue list --state open --limit 10 --json number,title,body,labels 2>/dev/null || echo "[]"', { cwd: this.projectRoot, encoding: 'utf-8', timeout: 30000 });
            const issues = JSON.parse(output);
            for (const issue of issues) {
                const id = `issue-${issue.number}`;
                if (this.processedIds.has(id))
                    continue;
                // Determine priority from labels
                let priority = 'medium';
                const labels = issue.labels?.map((l) => l.name.toLowerCase()) || [];
                if (labels.includes('critical') || labels.includes('urgent')) {
                    priority = 'critical';
                }
                else if (labels.includes('bug') || labels.includes('high')) {
                    priority = 'high';
                }
                else if (labels.includes('enhancement') || labels.includes('feature')) {
                    priority = 'medium';
                }
                else if (labels.includes('low') || labels.includes('nice-to-have')) {
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
        }
        catch {
            // gh CLI might not be available
        }
        return tasks;
    }
    // Check CIP proposals from database
    async scanCipProposals() {
        const tasks = [];
        try {
            const result = await db_1.db.query(`
        SELECT * FROM cips 
        WHERE status = 'pending' OR status = 'approved'
        ORDER BY created_at DESC
        LIMIT 10
      `);
            for (const cip of result.rows) {
                const id = `cip-${cip.id}`;
                if (this.processedIds.has(id))
                    continue;
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
        }
        catch {
            // Database might not have CIPs table
        }
        return tasks;
    }
    // Collect all tasks from all sources
    async collectAllTasks() {
        console.log('[TASKS] Scanning all task sources...');
        const [todoTasks, 
        // lintTasks,      // Commented out for performance - run manually
        // testTasks,      // Commented out for performance - run manually
        depsTasks, issueTasks, cipTasks] = await Promise.all([
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
    async getNextTask() {
        const allTasks = await this.collectAllTasks();
        // If we have critical/urgent tasks from real sources, use those first
        if (allTasks.length > 0) {
            // Sort by priority
            const priorityOrder = {
                'critical': 0,
                'high': 1,
                'medium': 2,
                'low': 3
            };
            allTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            // Only use real sources for critical/high priority
            const topTask = allTasks[0];
            if (topTask.priority === 'critical' || topTask.priority === 'high') {
                this.processedIds.add(topTask.id);
                return this.convertToAgentTask(topTask);
            }
        }
        // Fall back to the massive task backlog
        const backlogTask = (0, TaskBacklog_1.getNextBacklogTask)();
        if (backlogTask) {
            const progress = (0, TaskBacklog_1.getBacklogProgress)();
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
    convertBacklogTask(backlog) {
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
        (0, TaskBacklog_1.markBacklogTaskComplete)(backlog.id);
        return {
            id: backlog.id,
            type: backlog.type,
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
    convertToAgentTask(source) {
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
        let type = 'build';
        if (source.source === 'code_error' || source.title.toLowerCase().includes('fix')) {
            type = 'fix';
        }
        else if (source.source === 'chain_event') {
            type = 'audit';
        }
        else if (source.source === 'dependency') {
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
    markCompleted(taskId) {
        this.pendingTasks.delete(taskId);
        this.processedIds.add(taskId);
    }
    // Get pending task count
    getPendingCount() {
        return this.pendingTasks.size;
    }
}
exports.TaskSources = TaskSources;
// Priority order mapping
const priorityOrder = {
    'critical': 1.0,
    'high': 0.8,
    'medium': 0.5,
    'low': 0.3
};
// Export singleton
exports.taskSources = new TaskSources();
//# sourceMappingURL=TaskSources.js.map