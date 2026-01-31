import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { AgentTool, ToolResult } from './index';
import { eventBus } from '../../events/EventBus';

// Commands that are completely blocked
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
  'curl .* \\|.*sh',
  'shutdown',
  'reboot',
  'halt',
  'init 0',
  'poweroff'
];

// Allowed commands (whitelist approach for safety)
const ALLOWED_COMMAND_PREFIXES = [
  'npm',       // Package management
  'npx',       // Package execution
  'node',      // Node.js
  'git',       // Version control
  'echo',      // Output
  'cat',       // View files
  'ls',        // List files
  'pwd',       // Current directory
  'head',      // View file start
  'tail',      // View file end
  'grep',      // Search
  'find',      // Find files
  'wc',        // Word count
  'diff',      // Compare files
  'tsc',       // TypeScript
  'eslint',    // Linting
  'prettier',  // Formatting
  'jest',      // Testing
  'vitest',    // Testing
  'which',     // Find command location
  'env',       // Environment (read-only)
  'date',      // Date/time
  'whoami'     // Current user
];

// Git subcommands that are blocked
const BLOCKED_GIT_SUBCOMMANDS = [
  'push --force',
  'push -f',
  'reset --hard',
  'clean -fd',
  'rm',  // File deletion via git
  'mv'   // File moving via git
];

function getProjectRoot(): string {
  if (process.env.PROJECT_ROOT) {
    return process.env.PROJECT_ROOT;
  }
  if (fs.existsSync('/app/backend')) {
    return '/app';
  }
  return path.resolve(__dirname, '../../../../');
}

export class CommandTool implements AgentTool {
  name = 'run_command';
  description = 'Run a shell command in the project directory. Use for npm, git, or other CLI tools. Some dangerous commands are blocked for safety.';
  
  schema = {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: 'The command to run (e.g., "npm test", "git status", "ls -la")'
      },
      timeout: {
        type: 'number',
        description: 'Timeout in milliseconds (default: 30000, max: 300000)'
      },
      cwd: {
        type: 'string',
        description: 'Working directory relative to project root (default: project root)'
      }
    },
    required: ['command']
  };

  private projectRoot: string;
  private defaultTimeout: number = 30000;
  private maxTimeout: number = 300000; // 5 minutes max
  private maxOutputLength: number = 50000; // 50KB max output

  constructor() {
    this.projectRoot = getProjectRoot();
  }

  private isCommandSafe(command: string): { safe: boolean; reason?: string } {
    const lowerCommand = command.toLowerCase().trim();
    const firstWord = lowerCommand.split(/\s+/)[0];
    
    // Check blocked commands
    for (const blocked of BLOCKED_COMMANDS) {
      if (lowerCommand.includes(blocked.toLowerCase())) {
        return { safe: false, reason: `Blocked command pattern: ${blocked}` };
      }
    }
    
    // Check if command starts with allowed prefix
    const isAllowed = ALLOWED_COMMAND_PREFIXES.some(prefix => 
      firstWord === prefix || firstWord.endsWith('/' + prefix)
    );
    
    if (!isAllowed) {
      return { 
        safe: false, 
        reason: `Command '${firstWord}' not in allowed list. Allowed: ${ALLOWED_COMMAND_PREFIXES.join(', ')}` 
      };
    }
    
    // Special checks for git commands
    if (firstWord === 'git') {
      for (const blocked of BLOCKED_GIT_SUBCOMMANDS) {
        if (lowerCommand.includes(blocked)) {
          return { safe: false, reason: `Git subcommand '${blocked}' is blocked for safety` };
        }
      }
    }
    
    // Block sudo
    if (lowerCommand.startsWith('sudo ') || lowerCommand.includes(' sudo ')) {
      return { safe: false, reason: 'sudo is not allowed' };
    }
    
    // Block dangerous redirections outside project
    if (lowerCommand.includes('>') && (
      lowerCommand.includes('/etc') ||
      lowerCommand.includes('/var') ||
      lowerCommand.includes('/usr')
    )) {
      return { safe: false, reason: 'Redirecting to system directories is not allowed' };
    }
    
    return { safe: true };
  }

  async execute(params: { command: string; timeout?: number; cwd?: string }): Promise<ToolResult> {
    const startTime = Date.now();
    
    if (!params.command) {
      return {
        success: false,
        error: 'Command is required',
        duration: Date.now() - startTime
      };
    }

    const safetyCheck = this.isCommandSafe(params.command);
    if (!safetyCheck.safe) {
      return {
        success: false,
        error: safetyCheck.reason || 'Command blocked for safety',
        duration: Date.now() - startTime
      };
    }

    const timeout = Math.min(
      params.timeout || this.defaultTimeout,
      this.maxTimeout
    );

    // Determine working directory
    let cwd = this.projectRoot;
    if (params.cwd) {
      const requestedCwd = path.resolve(this.projectRoot, params.cwd);
      if (requestedCwd.startsWith(this.projectRoot) && fs.existsSync(requestedCwd)) {
        cwd = requestedCwd;
      }
    }

    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const child = spawn('sh', ['-c', params.command], {
        cwd,
        env: {
          ...process.env,
          CI: 'true', // Prevent interactive prompts
          FORCE_COLOR: '0', // Disable color codes
          TERM: 'dumb'
        }
      });

      const timeoutHandle = setTimeout(() => {
        timedOut = true;
        child.kill('SIGTERM');
      }, timeout);

      child.stdout.on('data', (data) => {
        const chunk = data.toString();
        stdout += chunk;
        
        // Stream to frontend
        eventBus.emit('agent_output', {
          type: 'stdout',
          content: chunk.substring(0, 1000) // Limit streamed chunks
        });
      });

      child.stderr.on('data', (data) => {
        const chunk = data.toString();
        stderr += chunk;
        
        eventBus.emit('agent_output', {
          type: 'stderr',
          content: chunk.substring(0, 1000)
        });
      });

      child.on('close', (code) => {
        clearTimeout(timeoutHandle);
        const duration = Date.now() - startTime;
        
        const output = (stdout + stderr).substring(0, this.maxOutputLength);
        
        eventBus.emit('agent_action', {
          type: 'run_command',
          command: params.command,
          exitCode: code,
          duration
        });

        if (timedOut) {
          resolve({
            success: false,
            output,
            error: `Command timed out after ${timeout}ms`,
            duration
          });
        } else {
          resolve({
            success: code === 0,
            output,
            data: { exitCode: code },
            duration
          });
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeoutHandle);
        resolve({
          success: false,
          error: error.message,
          duration: Date.now() - startTime
        });
      });
    });
  }
}

export const commandTool = new CommandTool();
