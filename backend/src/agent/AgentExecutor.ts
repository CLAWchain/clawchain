import { spawn, ChildProcess, execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { eventBus } from '../events/EventBus';
import { gitIntegration } from './GitIntegration';
import { browserAutomation, BROWSER_TOOLS } from './BrowserAutomation';

// Execution result
export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode?: number;
  duration: number;
}

// File operation result
export interface FileResult {
  success: boolean;
  path: string;
  content?: string;
  error?: string;
}

// Git operation result
export interface GitResult {
  success: boolean;
  output: string;
  error?: string;
  branch?: string;
  commit?: string;
}

// Tool definitions for Claude
export const AGENT_TOOLS = [
  {
    name: 'read_file',
    description: 'Read the contents of a file in the ClawChain codebase',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Relative path to the file from project root'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'write_file',
    description: 'Write content to a file. Creates the file if it doesn\'t exist.',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Relative path to the file from project root'
        },
        content: {
          type: 'string',
          description: 'Content to write to the file'
        }
      },
      required: ['path', 'content']
    }
  },
  {
    name: 'run_command',
    description: 'Run a shell command in the project directory. Use for npm, git, or other CLI tools.',
    input_schema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The command to run'
        },
        timeout: {
          type: 'number',
          description: 'Timeout in milliseconds (default: 30000)'
        }
      },
      required: ['command']
    }
  },
  {
    name: 'list_files',
    description: 'List files in a directory',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Relative path to directory (default: project root)'
        },
        recursive: {
          type: 'boolean',
          description: 'List files recursively (default: false)'
        }
      },
      required: []
    }
  },
  {
    name: 'search_code',
    description: 'Search for a pattern in the codebase',
    input_schema: {
      type: 'object',
      properties: {
        pattern: {
          type: 'string',
          description: 'Text pattern to search for'
        },
        file_pattern: {
          type: 'string',
          description: 'File glob pattern (e.g., "*.ts")'
        }
      },
      required: ['pattern']
    }
  },
  {
    name: 'git_status',
    description: 'Get current git status (branch, changes, etc.)',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'git_commit',
    description: 'Stage changes and create a git commit',
    input_schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Commit message'
        },
        files: {
          type: 'array',
          items: { type: 'string' },
          description: 'Files to stage (default: all changed files)'
        }
      },
      required: ['message']
    }
  },
  {
    name: 'git_branch',
    description: 'Create a new feature branch for this task',
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Branch name (will be prefixed with claw/)'
        }
      },
      required: ['name']
    }
  },
  {
    name: 'git_push',
    description: 'Push current branch to remote',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'create_pr',
    description: 'Create a pull request for the current branch',
    input_schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'PR title'
        },
        body: {
          type: 'string',
          description: 'PR description'
        }
      },
      required: ['title', 'body']
    }
  },
  {
    name: 'explain',
    description: 'Explain what you\'re thinking or about to do. This is streamed to the frontend terminal.',
    input_schema: {
      type: 'object',
      properties: {
        thought: {
          type: 'string',
          description: 'Your explanation or thought process'
        }
      },
      required: ['thought']
    }
  },
  // Browser tools
  ...BROWSER_TOOLS
];

// Blocked commands for safety
const BLOCKED_COMMANDS = [
  'rm -rf /',
  'rm -rf /*',
  'sudo rm',
  'mkfs',
  'dd if=',
  ':(){:|:&};:',
  'chmod -R 777 /',
  '> /dev/sda',
  'mv /* ',
  'wget .* \\|.*sh',
  'curl .* \\|.*sh'
];

// Blocked file paths
const BLOCKED_PATHS = [
  '/etc',
  '/usr',
  '/bin',
  '/sbin',
  '/var',
  '/root',
  '/home',
  '~',
  '..',
  '.env',
  'node_modules',
  '.git/objects',
  '.git/hooks'
];

export class AgentExecutor {
  private projectRoot: string;
  private maxOutputLength: number = 10000;
  private commandTimeout: number = 30000;

  constructor(projectRoot?: string) {
    // Default to /app in production (Docker/Railway), or project root in development
    if (projectRoot) {
      this.projectRoot = projectRoot;
    } else if (process.env.PROJECT_ROOT) {
      this.projectRoot = process.env.PROJECT_ROOT;
    } else if (fs.existsSync('/app/backend')) {
      // Production container
      this.projectRoot = '/app';
    } else {
      // Development - go up from backend/src/agent or backend/dist/agent
      this.projectRoot = path.resolve(__dirname, '../../../');
      if (!fs.existsSync(path.join(this.projectRoot, 'backend'))) {
        this.projectRoot = path.resolve(__dirname, '../../../../');
      }
    }
    console.log(`[EXECUTOR] Initialized with project root: ${this.projectRoot}`);
  }

  // Validate path is safe
  private isPathSafe(filePath: string): boolean {
    const normalizedPath = path.normalize(filePath);
    
    // Block absolute paths outside project
    if (path.isAbsolute(normalizedPath)) {
      if (!normalizedPath.startsWith(this.projectRoot)) {
        return false;
      }
    }
    
    // Block dangerous paths
    for (const blocked of BLOCKED_PATHS) {
      if (normalizedPath.includes(blocked)) {
        return false;
      }
    }
    
    return true;
  }

  // Validate command is safe
  private isCommandSafe(command: string): boolean {
    const lowerCommand = command.toLowerCase();
    
    for (const blocked of BLOCKED_COMMANDS) {
      if (lowerCommand.includes(blocked.toLowerCase())) {
        return false;
      }
    }
    
    // Block sudo
    if (lowerCommand.startsWith('sudo ')) {
      return false;
    }
    
    return true;
  }

  // Get full path from relative path
  private getFullPath(relativePath: string): string {
    if (path.isAbsolute(relativePath)) {
      return relativePath;
    }
    return path.join(this.projectRoot, relativePath);
  }

  // Read a file
  async readFile(filePath: string): Promise<FileResult> {
    const fullPath = this.getFullPath(filePath);
    
    if (!this.isPathSafe(filePath)) {
      return {
        success: false,
        path: filePath,
        error: 'Path not allowed for security reasons'
      };
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      eventBus.emit('agent_action', {
        type: 'read_file',
        path: filePath,
        size: content.length
      });

      return {
        success: true,
        path: filePath,
        content: content.substring(0, this.maxOutputLength)
      };
    } catch (error: any) {
      return {
        success: false,
        path: filePath,
        error: error.message
      };
    }
  }

  // Write to a file
  async writeFile(filePath: string, content: string): Promise<FileResult> {
    const fullPath = this.getFullPath(filePath);
    
    if (!this.isPathSafe(filePath)) {
      return {
        success: false,
        path: filePath,
        error: 'Path not allowed for security reasons'
      };
    }

    try {
      // Create directory if it doesn't exist
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(fullPath, content, 'utf-8');
      
      eventBus.emit('agent_action', {
        type: 'write_file',
        path: filePath,
        size: content.length
      });

      return {
        success: true,
        path: filePath
      };
    } catch (error: any) {
      return {
        success: false,
        path: filePath,
        error: error.message
      };
    }
  }

  // Run a shell command
  async runCommand(command: string, timeout?: number): Promise<ExecutionResult> {
    if (!this.isCommandSafe(command)) {
      return {
        success: false,
        output: '',
        error: 'Command blocked for security reasons',
        duration: 0
      };
    }

    const startTime = Date.now();
    const execTimeout = timeout || this.commandTimeout;

    return new Promise((resolve) => {
      const child = spawn('sh', ['-c', command], {
        cwd: this.projectRoot,
        timeout: execTimeout,
        env: {
          ...process.env,
          CI: 'true', // Prevent interactive prompts
          FORCE_COLOR: '0' // Disable color codes
        }
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        const chunk = data.toString();
        stdout += chunk;
        
        // Stream to frontend
        eventBus.emit('agent_output', {
          type: 'stdout',
          content: chunk
        });
      });

      child.stderr.on('data', (data) => {
        const chunk = data.toString();
        stderr += chunk;
        
        eventBus.emit('agent_output', {
          type: 'stderr',
          content: chunk
        });
      });

      child.on('close', (code) => {
        const duration = Date.now() - startTime;
        
        eventBus.emit('agent_action', {
          type: 'run_command',
          command,
          exitCode: code,
          duration
        });

        resolve({
          success: code === 0,
          output: (stdout + stderr).substring(0, this.maxOutputLength),
          exitCode: code || 0,
          duration
        });
      });

      child.on('error', (error) => {
        const duration = Date.now() - startTime;
        resolve({
          success: false,
          output: '',
          error: error.message,
          duration
        });
      });

      // Handle timeout
      setTimeout(() => {
        child.kill('SIGTERM');
      }, execTimeout);
    });
  }

  // List files in directory
  async listFiles(dirPath: string = '', recursive: boolean = false): Promise<string[]> {
    const fullPath = this.getFullPath(dirPath || '.');
    
    if (!this.isPathSafe(dirPath)) {
      return [];
    }

    try {
      if (recursive) {
        return this.listFilesRecursive(fullPath, dirPath || '.');
      } else {
        const entries = fs.readdirSync(fullPath, { withFileTypes: true });
        return entries.map(entry => {
          const prefix = entry.isDirectory() ? '[DIR] ' : '';
          return prefix + path.join(dirPath || '.', entry.name);
        });
      }
    } catch (error) {
      return [];
    }
  }

  private listFilesRecursive(fullPath: string, relativePath: string): string[] {
    const results: string[] = [];
    
    try {
      const entries = fs.readdirSync(fullPath, { withFileTypes: true });
      
      for (const entry of entries) {
        // Skip node_modules and .git
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        
        const entryPath = path.join(relativePath, entry.name);
        
        if (entry.isDirectory()) {
          results.push('[DIR] ' + entryPath);
          results.push(...this.listFilesRecursive(
            path.join(fullPath, entry.name),
            entryPath
          ));
        } else {
          results.push(entryPath);
        }
      }
    } catch (error) {
      // Ignore errors for individual directories
    }
    
    return results;
  }

  // Search for pattern in code
  async searchCode(pattern: string, filePattern?: string): Promise<{ file: string; line: number; content: string }[]> {
    const results: { file: string; line: number; content: string }[] = [];
    
    try {
      const grepCommand = filePattern 
        ? `grep -rn "${pattern}" --include="${filePattern}" . 2>/dev/null | head -50`
        : `grep -rn "${pattern}" --include="*.ts" --include="*.tsx" --include="*.js" . 2>/dev/null | head -50`;
      
      const output = execSync(grepCommand, {
        cwd: this.projectRoot,
        encoding: 'utf-8',
        timeout: 10000
      });

      const lines = output.split('\n').filter(Boolean);
      for (const line of lines) {
        const match = line.match(/^\.\/(.+?):(\d+):(.*)$/);
        if (match) {
          results.push({
            file: match[1],
            line: parseInt(match[2], 10),
            content: match[3].trim()
          });
        }
      }
    } catch (error) {
      // grep returns non-zero if no matches
    }
    
    return results;
  }

  // Get git status
  async gitStatus(): Promise<GitResult> {
    try {
      const branch = execSync('git branch --show-current', {
        cwd: this.projectRoot,
        encoding: 'utf-8'
      }).trim();

      const status = execSync('git status --porcelain', {
        cwd: this.projectRoot,
        encoding: 'utf-8'
      });

      const lastCommit = execSync('git log -1 --oneline', {
        cwd: this.projectRoot,
        encoding: 'utf-8'
      }).trim();

      return {
        success: true,
        output: status || 'Working tree clean',
        branch,
        commit: lastCommit
      };
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: error.message
      };
    }
  }

  // Create git commit
  async gitCommit(message: string, files?: string[]): Promise<GitResult> {
    try {
      // Stage files
      if (files && files.length > 0) {
        for (const file of files) {
          if (this.isPathSafe(file)) {
            execSync(`git add "${file}"`, {
              cwd: this.projectRoot,
              encoding: 'utf-8'
            });
          }
        }
      } else {
        // Stage all changes
        execSync('git add -A', {
          cwd: this.projectRoot,
          encoding: 'utf-8'
        });
      }

      // Create commit
      const commitOutput = execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, {
        cwd: this.projectRoot,
        encoding: 'utf-8'
      });

      // Get new commit hash
      const commitHash = execSync('git rev-parse --short HEAD', {
        cwd: this.projectRoot,
        encoding: 'utf-8'
      }).trim();

      eventBus.emit('agent_action', {
        type: 'git_commit',
        message,
        commit: commitHash
      });

      return {
        success: true,
        output: commitOutput,
        commit: commitHash
      };
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: error.message
      };
    }
  }

  // Execute a tool call from Claude
  async executeTool(toolName: string, args: any): Promise<any> {
    console.log(`[EXECUTOR] Running tool: ${toolName}`, args);
    
    eventBus.emit('agent_tool_start', { tool: toolName, args });

    let result: any;

    switch (toolName) {
      case 'read_file':
        result = await this.readFile(args.path);
        break;
      
      case 'write_file':
        result = await this.writeFile(args.path, args.content);
        break;
      
      case 'run_command':
        result = await this.runCommand(args.command, args.timeout);
        break;
      
      case 'list_files':
        result = { files: await this.listFiles(args.path, args.recursive) };
        break;
      
      case 'search_code':
        result = { matches: await this.searchCode(args.pattern, args.file_pattern) };
        break;
      
      case 'git_status':
        result = await this.gitStatus();
        break;
      
      case 'git_commit':
        result = await this.gitCommit(args.message, args.files);
        break;
      
      case 'git_branch':
        result = await gitIntegration.createTaskBranch(
          Date.now().toString(36),
          args.name
        );
        break;
      
      case 'git_push':
        result = await gitIntegration.push();
        break;
      
      case 'create_pr':
        result = await gitIntegration.createPullRequest(args.title, args.body);
        break;
      
      case 'explain':
        // Just emit the explanation for streaming
        eventBus.emit('agent_thought', { thought: args.thought });
        result = { acknowledged: true };
        break;
      
      // Browser tools
      case 'browse_url':
      case 'screenshot_url':
      case 'check_deployment':
      case 'search_web':
      case 'extract_links':
        result = await browserAutomation.executeTool(toolName, args);
        break;
      
      default:
        result = { error: `Unknown tool: ${toolName}` };
    }

    eventBus.emit('agent_tool_complete', { tool: toolName, result });
    
    return result;
  }
}

// Export singleton instance
export const agentExecutor = new AgentExecutor();
